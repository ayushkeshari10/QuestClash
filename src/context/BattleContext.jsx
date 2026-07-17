import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { supabase } from '../supabaseClient';
import { playDing, playError } from '../soundService';

const BattleContext = createContext(null);

export const useBattle = () => {
  const context = useContext(BattleContext);
  if (!context) {
    throw new Error('useBattle must be used within a BattleProvider');
  }
  return context;
};

export const BattleProvider = ({ children }) => {
  const { currentUser, updateUserBattle } = useAuth();
  const { toast } = useToast();
  
  const [activeBattle, setActiveBattle] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [feedEvents, setFeedEvents] = useState([]);
  const channelRef = useRef(null);
  
  // Countdown timer state
  const [countdown, setCountdown] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00',
    totalSeconds: 86400
  });

  // Re-fetch and assemble the current active battle room
  const refreshActiveBattle = useCallback(async () => {
    if (!currentUser) {
      setActiveBattle(null);
      return;
    }

    try {
      // 1. Get the profile to retrieve their active battle_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('battle_id')
        .eq('id', currentUser.id)
        .single();

      let targetBattleId = profile?.battle_id;

      // 2. If no battle_id is linked to the user's profile, check if there is an active battle lobby with OPEN SLOTS created today
      if (!targetBattleId) {
        const { data: latestActive } = await supabase
          .from('battles')
          .select('id')
          .eq('status', 'active')
          .or('player_b_id.is.null,player_c_id.is.null')
          .order('started_at', { ascending: false })
          .limit(1);

        if (latestActive && latestActive.length > 0) {
          targetBattleId = latestActive[0].id;
        }
      }

      if (!targetBattleId) {
        setActiveBattle(null);
        return;
      }

      // 3. Fetch the battle row details
      const { data: battleRow } = await supabase
        .from('battles')
        .select('*')
        .eq('id', targetBattleId)
        .single();

      if (!battleRow) {
        setActiveBattle(null);
        return;
      }

      // 4. Fetch the profiles of participants in the battle
      const playerIds = [battleRow.player_a_id, battleRow.player_b_id, battleRow.player_c_id].filter(Boolean);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', playerIds);

      // 5. Fetch all tasks for this battle
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('battle_id', targetBattleId);

      // 6. Map and assemble the nested battle structure expected by the frontend
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));
      const tasksByUser = {};
      playerIds.forEach(id => { tasksByUser[id] = []; });
      
      (tasks || []).forEach(t => {
        if (tasksByUser[t.user_id]) {
          tasksByUser[t.user_id].push({
            id: t.id,
            title: t.title,
            description: t.description,
            priority: t.priority,
            time: t.time,
            status: t.status,
            createdAt: t.created_at
          });
        }
      });

      const makePlayerObj = (uid) => {
        if (!uid) return null;
        const p = profileMap.get(uid);
        if (!p) return null;
        const userTasks = tasksByUser[uid] || [];
        const completed = userTasks.filter(t => t.status === 'completed').length;
        
        return {
          id: p.id,
          username: p.username,
          avatar: p.avatar_url,
          tasks: userTasks,
          points: completed,
          completionRate: userTasks.length > 0 ? Math.round((completed / userTasks.length) * 100) : 0
        };
      };

      const assembled = {
        id: battleRow.id,
        code: battleRow.code,
        status: battleRow.status,
        startedAt: battleRow.started_at,
        doodleA: battleRow.doodle_a || '',
        doodleB: battleRow.doodle_b || '',
        doodleC: battleRow.doodle_c || '',
        chat: battleRow.chat || [],
        playerA: makePlayerObj(battleRow.player_a_id),
        playerB: makePlayerObj(battleRow.player_b_id),
        playerC: makePlayerObj(battleRow.player_c_id)
      };

      setActiveBattle(assembled);
    } catch (err) {
      console.error('Error refreshing active battle details:', err);
    }
  }, [currentUser]);

  // Fetch the completed battle reports history logs
  const refreshHistoryList = useCallback(async () => {
    if (!currentUser) return;
    try {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        const parsedHistory = data.map(h => ({
          id: h.id,
          date: h.date,
          winner: h.winner,
          isDraw: h.is_draw,
          ...h.battle_data
        }));
        
        // No seeded history, just display whatever is in the database
        setHistoryList(parsedHistory);
      }
    } catch (e) {
      console.error('Error fetching history logs:', e);
    }
  }, [currentUser]);

  // Real-time PostgreSQL CDC subscriptions
  useEffect(() => {
    if (!currentUser) return;

    refreshActiveBattle();
    refreshHistoryList();

    // Subscribe to realtime updates on battles, tasks, and profiles tables
    const channel = supabase.channel('table-sync-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'battles' }, async () => {
        await refreshActiveBattle();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, async () => {
        await refreshActiveBattle();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, async () => {
        await refreshActiveBattle();
      })
      .on('broadcast', { event: 'task-feed' }, (payload) => {
        // Play native synthesized sound instead of missing MP3 file
        try {
          playDing();
        } catch (e) {}

        setFeedEvents(prev => [...prev, payload.payload].slice(-5));
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser, refreshActiveBattle, refreshHistoryList]);

  // Helper to resolve user slot (playerA, playerB, or playerC)
  const getPlayerIndex = (battle) => {
    if (!battle || !currentUser) return null;
    if (battle.playerA && battle.playerA.id === currentUser.id) return 'playerA';
    if (battle.playerB && battle.playerB.id === currentUser.id) return 'playerB';
    if (battle.playerC && battle.playerC.id === currentUser.id) return 'playerC';
    return null;
  };

  // Create Battle Lobby
  const createBattle = async () => {
    if (!currentUser) return;
    
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: newBattle, error } = await supabase
      .from('battles')
      .insert({
        code,
        player_a_id: currentUser.id,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to create battle lobby');
    }

    await updateUserBattle(currentUser.id, newBattle.id);
    await refreshActiveBattle();
    toast.success(`Battle Lobby Created!`);
    return newBattle;
  };

  // Join the active battle lobby
  const joinActiveBattleLobby = async () => {
    if (!currentUser) return;

    // Fetch freshest battle row with OPEN SLOTS to prevent race conditions
    const { data: latestActive } = await supabase
      .from('battles')
      .select('*')
      .eq('status', 'active')
      .or('player_b_id.is.null,player_c_id.is.null')
      .order('started_at', { ascending: false })
      .limit(1);

    if (!latestActive || latestActive.length === 0) {
      toast.error('No active battle lobby found!');
      return;
    }

    const battleRow = latestActive[0];

    // Check if already in the lobby
    if (
      battleRow.player_a_id === currentUser.id ||
      battleRow.player_b_id === currentUser.id ||
      battleRow.player_c_id === currentUser.id
    ) {
      await updateUserBattle(currentUser.id, battleRow.id);
      await refreshActiveBattle();
      return;
    }

    let updates = {};
    if (!battleRow.player_b_id) {
      updates = { player_b_id: currentUser.id };
    } else if (!battleRow.player_c_id) {
      updates = { player_c_id: currentUser.id };
    } else {
      toast.error('Arena is full!');
      return;
    }

    const { error } = await supabase
      .from('battles')
      .update(updates)
      .eq('id', battleRow.id);

    if (error) {
      toast.error('Failed to enter the arena');
      return;
    }

    await updateUserBattle(currentUser.id, battleRow.id);
    await refreshActiveBattle();
    toast.success('Successfully entered the Battle Arena!');
  };

  // Add Task
  const addTask = async (title, description, priority, time) => {
    if (!currentUser || !activeBattle || activeBattle.status === 'frozen') return;

    const playerKey = getPlayerIndex(activeBattle);
    if (!playerKey) {
      toast.error('You are not a participant in this battle');
      return;
    }

    const { error } = await supabase
      .from('tasks')
      .insert({
        battle_id: activeBattle.id,
        user_id: currentUser.id,
        title,
        description,
        priority,
        time: time || '12:00',
        status: 'pending'
      });

    if (error) {
      toast.error('Failed to create task');
    } else {
      await refreshActiveBattle();
      toast.success(`Task "${title}" added!`);
    }
  };

  // Update Task Status (Mark Complete / Mark Failed)
  const updateTaskStatus = async (taskId, newStatus) => {
    if (!currentUser || !activeBattle || activeBattle.status === 'frozen') return;

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId);

    if (error) {
      toast.error('Failed to update task');
    } else {
      await refreshActiveBattle();
      if (newStatus === 'completed') {
        playDing();
        toast.success('Task Completed! +1 Point');
        
        // Broadcast to everyone else in the arena
        if (channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'task-feed',
            payload: { 
              id: Date.now(),
              username: currentUser.username, 
              message: 'just scored a point! 🔥' 
            }
          });
          
          // And add it to our own feed locally since broadcast doesn't echo
          setFeedEvents(prev => [...prev, {
            id: Date.now(),
            username: currentUser.username, 
            message: 'just scored a point! 🔥' 
          }].slice(-5));
        }
      } else if (newStatus === 'failed') {
        playError();
        toast.error('Marked as Failed');
      }
    }
  };

  // Postpone Task
  const postponeTask = async (taskId, newTime) => {
    if (!currentUser || !activeBattle || activeBattle.status === 'frozen') return;

    const { error } = await supabase
      .from('tasks')
      .update({
        status: 'postponed',
        time: newTime
      })
      .eq('id', taskId);

    if (error) {
      toast.error('Failed to postpone task');
    } else {
      await refreshActiveBattle();
      playError();
      toast.warning(`Task postponed to ${newTime}`);
    }
  };

  // Delete Task
  const deleteTask = async (taskId) => {
    if (!currentUser || !activeBattle || activeBattle.status === 'frozen') return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      toast.error('Failed to delete task');
    } else {
      await refreshActiveBattle();
      toast.success('Task deleted successfully!');
    }
  };

  // Update Sketchpad Doodle
  const updateDoodle = async (doodleDataUrl) => {
    if (!currentUser || !activeBattle) return;

    const playerKey = getPlayerIndex(activeBattle);
    if (!playerKey) return;

    let updates = {};
    if (playerKey === 'playerA') updates = { doodle_a: doodleDataUrl };
    else if (playerKey === 'playerB') updates = { doodle_b: doodleDataUrl };
    else if (playerKey === 'playerC') updates = { doodle_c: doodleDataUrl };

    const { error } = await supabase
      .from('battles')
      .update(updates)
      .eq('id', activeBattle.id);

    if (error) {
      toast.error('Failed to save sketch');
    } else {
      await refreshActiveBattle();
      toast.success('Mood doodle saved!');
    }
  };

  // Send Chat message
  const sendBanter = async (messageText) => {
    if (!currentUser || !activeBattle) return;

    const newMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: currentUser.username,
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedChatList = [...(activeBattle.chat || []), newMessage];

    const { error } = await supabase
      .from('battles')
      .update({ chat: updatedChatList })
      .eq('id', activeBattle.id);

    if (error) {
      toast.error('Message failed to send');
    } else {
      await refreshActiveBattle();
    }
  };

  // Quit Lobby / Close Battle
  const leaveBattle = async () => {
    if (!currentUser || !activeBattle) return;

    const playerKey = getPlayerIndex(activeBattle);

    if (playerKey === 'playerA') {
      // Host closes the battle lobby
      await supabase
        .from('battles')
        .update({ status: 'frozen' })
        .eq('id', activeBattle.id);

      // Clear users references
      const playerIds = [
        activeBattle.playerA?.id,
        activeBattle.playerB?.id,
        activeBattle.playerC?.id
      ].filter(Boolean);

      await supabase
        .from('profiles')
        .update({ battle_id: null })
        .in('id', playerIds);

      await updateUserBattle(currentUser.id, null);
      setActiveBattle(null);
      toast.success('You closed the battle lobby.');
    } else {
      // Guest leaves the battle lobby
      let updates = {};
      if (playerKey === 'playerB') updates = { player_b_id: null };
      else if (playerKey === 'playerC') updates = { player_c_id: null };

      await supabase
        .from('battles')
        .update(updates)
        .eq('id', activeBattle.id);

      await updateUserBattle(currentUser.id, null);
      setActiveBattle(null);
      toast.success('You left the battle lobby.');
    }
  };

  // Trigger Simulated Midnight Report Calculation
  const triggerSimulatedMidnight = async () => {
    if (!activeBattle || activeBattle.status !== 'active') return;

    const pA = activeBattle.playerA;
    const pB = activeBattle.playerB;
    const pC = activeBattle.playerC;

    // Resolve Winner
    let winnerName = 'Draw';
    let isDraw = true;

    const scores = [];
    if (pA) scores.push({ name: pA.username, pts: pA.points, rate: pA.completionRate });
    if (pB) scores.push({ name: pB.username, pts: pB.points, rate: pB.completionRate });
    if (pC) scores.push({ name: pC.username, pts: pC.points, rate: pC.completionRate });

    if (scores.length > 1) {
      scores.sort((x, y) => {
        if (x.pts !== y.pts) return y.pts - x.pts;
        return y.rate - x.rate;
      });

      const first = scores[0];
      const second = scores[1];
      if (first.pts > second.pts || (first.pts === second.pts && first.rate > second.rate)) {
        winnerName = first.name;
        isDraw = false;
      }
    } else if (scores.length === 1) {
      winnerName = scores[0].name;
      isDraw = false;
    }

    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const finalReport = {
      playerA: pA ? { username: pA.username, points: pA.points, completionRate: pA.completionRate, tasks: pA.tasks } : null,
      playerB: pB ? { username: pB.username, points: pB.points, completionRate: pB.completionRate, tasks: pB.tasks } : null,
      playerC: pC ? { username: pC.username, points: pC.points, completionRate: pC.completionRate, tasks: pC.tasks } : null
    };

    // 1. Insert History record
    const { error: histErr } = await supabase
      .from('history')
      .insert({
        date: todayStr,
        winner: winnerName,
        is_draw: isDraw,
        battle_data: finalReport
      });

    if (histErr) {
      toast.error('Failed to create history record');
      return;
    }

    // 2. Freeze the battle row
    await supabase
      .from('battles')
      .update({ status: 'frozen' })
      .eq('id', activeBattle.id);

    await refreshHistoryList();
    await refreshActiveBattle();
    toast.info('Midnight simulated! Check details in History.');
  };

  const startNewBattleDay = async () => {
    // Clear our active battle link and return home
    await updateUserBattle(currentUser.id, null);
    setActiveBattle(null);
  };

  const simulateOpponentActivity = () => {
    // In a live Supabase server setup, opponents trigger real actions in their own tabs.
    toast.info('Simulations disabled: Real database connected.');
  };

  // Countdown timer logic
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      
      const diffMs = midnight - now;
      const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
      
      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      
      setCountdown({
        hours: String(hrs).padStart(2, '0'),
        minutes: String(mins).padStart(2, '0'),
        seconds: String(secs).padStart(2, '0'),
        totalSeconds
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BattleContext.Provider
      value={{
        activeBattle,
        historyList,
        feedEvents,
        countdown,
        createBattle,
        addTask,
        updateTaskStatus,
        postponeTask,
        deleteTask,
        updateDoodle,
        sendBanter,
        leaveBattle,
        joinActiveBattleLobby,
        startNewBattleDay,
        triggerSimulatedMidnight,
        simulateOpponentActivity,
        getPlayerIndex
      }}
    >
      {children}
    </BattleContext.Provider>
  );
};
