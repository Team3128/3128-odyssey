"use client";

import { useState, useEffect } from "react";
import { 
  Battery, 
  Wifi, 
  Trophy, 
  Clock, 
  Users, 
  Zap, 
  AlertCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Thermometer,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface BatteryRecord {
  id: string;
  timestamp: number;
  batteryId: string;
  voltage: number;
  current: number;
  temperature: number;
  cycleCount: number;
  status: 'charging' | 'discharging' | 'idle';
  location: string;
  notes?: string;
}

interface Match {
  key: string;
  comp_level: string;
  match_number: number;
  alliances: {
    red: { team_keys: string[]; score: number };
    blue: { team_keys: string[]; score: number };
  };
  winning_alliance: string;
  time: number;
  actual_time?: number;
  score_breakdown?: any;
}

interface Ranking {
  rank: number;
  team_key: string;
  record: { wins: number; losses: number; ties: number };
  qual_average: number;
}

interface EPAData {
  overall: string;
  auto: string;
  teleop: string;
  endgame: string;
  source: 'statbotics' | 'local';
}

export default function NARPitDashboard() {
  const [activeTab, setActiveTab] = useState('setup');
  const [eventKey, setEventKey] = useState('');
  const [teamNumber, setTeamNumber] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [batteryData, setBatteryData] = useState<BatteryRecord[]>([]);
  const [batteryStats, setBatteryStats] = useState<any>({});
  const [liveEventData, setLiveEventData] = useState<any>(null);
  const [teamEPA, setTeamEPA] = useState<EPAData>({ overall: '0', auto: '0', teleop: '0', endgame: '0', source: 'local' });
  const [statboticsData, setStatboticsData] = useState<any>(null);
  const [streamUrl, setStreamUrl] = useState<any>(null);
  
  const [newBattery, setNewBattery] = useState({
    batteryId: '',
    voltage: '',
    current: '',
    temperature: '',
    status: 'idle' as 'charging' | 'discharging' | 'idle',
    location: '',
    notes: ''
  });

  const [expandedBattery, setExpandedBattery] = useState<string | null>(null);
  const [batteryFilter, setBatteryFilter] = useState('all');
  
  const [liveUpdateManager] = useState(() => ({
    intervals: new Map(),
    isLive: false,
    
    startLiveUpdates: function(callbacks: any, eventKey: string, teamNumber: string, intervalMs = 5000) {
      this.isLive = true;
      
      Object.entries(callbacks).forEach(([name, callback]: [string, any]) => {
        const interval = setInterval(async () => {
          if (this.isLive) {
            try {
              await callback(eventKey, teamNumber);
            } catch (error) {
              console.error(`Update error for ${name}:`, error);
            }
          }
        }, intervalMs);
        
        this.intervals.set(name, interval);
      });
    },
    
    stopLiveUpdates: function() {
      this.isLive = false;
      this.intervals.forEach((interval) => {
        clearInterval(interval);
      });
      this.intervals.clear();
    }
  }));

  const addBatteryRecord = async (batteryData: any) => {
    try {
      const response = await fetch('/api/battery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...batteryData, timestamp: Date.now() })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error adding battery record:', error);
      throw error;
    }
  };

  const getBatteryRecords = async () => {
    try {
      const response = await fetch('/api/battery');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching battery records:', error);
      return [];
    }
  };

  const fetchTeamMatches = async (eventKey: string, teamNumber: string) => {
    try {
      const response = await fetch(`/api/tba?endpoint=matches&eventKey=${eventKey}&teamNumber=${teamNumber}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.error ? null : data;
    } catch (error) {
      console.error('Error fetching team matches:', error);
      return null;
    }
  };

  const fetchEventMatches = async (eventKey: string) => {
    try {
      const response = await fetch(`/api/tba?endpoint=event-matches&eventKey=${eventKey}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.error ? null : data;
    } catch (error) {
      console.error('Error fetching event matches:', error);
      return null;
    }
  };

  const fetchEventRankings = async (eventKey: string) => {
    try {
      const response = await fetch(`/api/tba?endpoint=rankings&eventKey=${eventKey}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.error ? null : data;
    } catch (error) {
      console.error('Error fetching event rankings:', error);
      return null;
    }
  };

  const fetchLiveEventData = async (eventKey: string) => {
    try {
      const response = await fetch(`/api/nexus?eventKey=${eventKey}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.error ? null : data;
    } catch (error) {
      console.error('Error fetching live event data:', error);
      return null;
    }
  };

  const fetchStatboticsTeamData = async (teamNumber: string) => {
    try {
      const response = await fetch(`https://api.statbotics.io/v3/team_year/${teamNumber}/2025`);
      if (!response.ok) throw new Error(`Statbotics API error! status: ${response.status}`);
      const data = await response.json();
      return {
        epa: data.epa_end || data.epa_current || 0,
        autoEPA: data.auto_epa_end || data.auto_epa_current || 0,
        teleopEPA: data.teleop_epa_end || data.teleop_epa_current || 0,
        endgameEPA: data.endgame_epa_end || data.endgame_epa_current || 0,
        winRate: data.wins / Math.max(1, data.wins + data.losses + data.ties) || 0,
        record: `${data.wins || 0}-${data.losses || 0}-${data.ties || 0}`
      };
    } catch (error) {
      console.error('Error fetching Statbotics team data:', error);
      return null;
    }
  };

  const calculateEnhancedEPA = async (teamNumber: string, eventKey: string, teamMatches: any) => {
    try {
      const response = await fetch(`https://api.statbotics.io/v3/team_event/${teamNumber}/${eventKey}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.epa_end !== undefined) {
          return {
            overall: data.epa_end.toFixed(2),
            auto: (data.auto_epa_end || 0).toFixed(2),
            teleop: (data.teleop_epa_end || 0).toFixed(2),
            endgame: (data.endgame_epa_end || 0).toFixed(2),
            source: 'statbotics' as const
          };
        }
      }
    } catch (error) {
      console.error('Statbotics fetch failed, using local calculation:', error);
    }
    
    return calculateLocalEPA(teamMatches, teamNumber);
  };

  const calculateLocalEPA = (teamMatches: any, teamNumber: string) => {
    if (!teamMatches || teamMatches.length === 0) {
      return { overall: '0.00', auto: '0.00', teleop: '0.00', endgame: '0.00', source: 'local' as const };
    }
    
    let totalScore = 0;
    let validMatches = 0;
    
    teamMatches.forEach((match: any) => {
      if (match.alliances) {
        const isRed = match.alliances.red?.team_keys?.some((key: string) => key.includes(teamNumber));
        const score = isRed ? match.alliances.red?.score : match.alliances.blue?.score;
        
        if (score !== null && score !== undefined) {
          totalScore += score / 3;
          validMatches++;
        }
      }
    });
    
    const avgScore = validMatches > 0 ? (totalScore / validMatches) : 0;
    
    return {
      overall: avgScore.toFixed(2),
      auto: (avgScore * 0.3).toFixed(2),
      teleop: (avgScore * 0.5).toFixed(2),
      endgame: (avgScore * 0.2).toFixed(2),
      source: 'local' as const
    };
  };

  const fetchLiveStreamUrl = async (eventKey: string) => {
    try {
      const response = await fetch(`https://www.thebluealliance.com/api/v3/event/${eventKey}/webcast`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const webcast = data[0];
          switch (webcast.type) {
            case 'youtube':
              return {
                type: 'youtube',
                channel: webcast.channel,
                url: `https://www.youtube.com/embed/${webcast.channel}/live?autoplay=1`
              };
            case 'twitch':
              return {
                type: 'twitch',
                channel: webcast.channel,
                url: `https://player.twitch.tv/?channel=${webcast.channel}&autoplay=true`
              };
            default:
              return { type: 'direct', url: webcast.url || webcast.file };
          }
        }
      }
      
      return {
        type: 'youtube',
        channel: 'FIRSTINSPIRES',
        url: 'https://www.youtube.com/embed/live_stream?channel=FIRSTINSPIRES&autoplay=1'
      };
    } catch (error) {
      console.error('Error fetching live stream URL:', error);
      return {
        type: 'youtube',
        channel: 'FIRSTINSPIRES',
        url: 'https://www.youtube.com/embed/live_stream?channel=FIRSTINSPIRES&autoplay=1'
      };
    }
  };

  const analyzeBatteryHealth = (batteryRecords: BatteryRecord[], batteryId: string) => {
    const records = batteryRecords.filter(r => r.batteryId === batteryId).sort((a, b) => a.timestamp - b.timestamp);
    
    if (records.length < 2) return { health: 'unknown', warnings: [] };
    
    const recent = records.slice(-3);
    const latest = records[records.length - 1];
    
    let health = 'good';
    let warnings: string[] = [];
    
    if (latest.voltage < 11.8) warnings.push('Low voltage');
    if (latest.temperature > 45) warnings.push('High temperature');
    
    const hoursAgo = (Date.now() - latest.timestamp) / (1000 * 60 * 60);
    if (hoursAgo > 2) warnings.push('Data outdated');
    
    if (warnings.length > 1) health = 'critical';
    else if (warnings.length > 0) health = 'warning';
    
    return { health, warnings };
  };

  const getBatteryUsageStats = (batteryRecords: BatteryRecord[]) => {
    const stats: any = {};
    const uniqueBatteries = [...new Set(batteryRecords.map(r => r.batteryId))];
    
    uniqueBatteries.forEach(batteryId => {
      const records = batteryRecords.filter(r => r.batteryId === batteryId).sort((a, b) => a.timestamp - b.timestamp);
      const analysis = analyzeBatteryHealth(batteryRecords, batteryId);
      const latest = records[records.length - 1];
      
      stats[batteryId] = {
        totalCycles: records.length,
        currentVoltage: latest?.voltage || 0,
        currentTemp: latest?.temperature || 0,
        lastUsed: latest?.timestamp || 0,
        status: analysis.health,
        location: latest?.location || 'Unknown',
        warnings: analysis.warnings,
        notes: latest?.notes || ''
      };
    });
    
    return stats;
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return 'Time TBD';
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  const formatDateTime = (timestamp: number) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString();
  };

  const getBatteryStatusColor = (battery: BatteryRecord) => {
    const hoursAgo = (Date.now() - battery.timestamp) / (1000 * 60 * 60);
    
    if (hoursAgo > 2) return 'text-yellow-600';
    if (battery.voltage < 11.8) return 'text-red-600';
    if (battery.temperature > 50) return 'text-red-600';
    if (battery.voltage < 12.0 || battery.temperature > 45) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBatteryStatus = (battery: BatteryRecord) => {
    const hoursAgo = (Date.now() - battery.timestamp) / (1000 * 60 * 60);
    
    if (hoursAgo > 2) return 'warning';
    if (battery.voltage < 11.8 || battery.temperature > 50) return 'critical';
    if (battery.voltage < 12.0 || battery.temperature > 45) return 'warning';
    return 'good';
  };

  const isSetupComplete = eventKey.trim() !== '' && teamNumber.trim() !== '';

  const loadAllData = async () => {
    if (!isSetupComplete) return;
    
    setIsLoading(true);
    try {
      const [matchesData, rankingsData, batteryRecords, liveData, streamData] = await Promise.all([
        fetchEventMatches(eventKey),
        fetchEventRankings(eventKey),
        getBatteryRecords(),
        fetchLiveEventData(eventKey),
        fetchLiveStreamUrl(eventKey)
      ]);

      setMatches(matchesData || []);
      setRankings(rankingsData?.rankings || []);
      setBatteryData(batteryRecords || []);
      setBatteryStats(getBatteryUsageStats(batteryRecords || []));
      setLiveEventData(liveData);
      setStreamUrl(streamData);
      
      const teamMatches = await fetchTeamMatches(eventKey, teamNumber);
      const [epaData, statboticsTeamData] = await Promise.all([
        calculateEnhancedEPA(teamNumber, eventKey, teamMatches),
        fetchStatboticsTeamData(teamNumber)
      ]);
      
      setTeamEPA(epaData);
      setStatboticsData(statboticsTeamData);
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBatteryData = async () => {
    try {
      const data = await getBatteryRecords();
      setBatteryData(data || []);
      setBatteryStats(getBatteryUsageStats(data || []));
    } catch (error) {
      console.error('Error refreshing battery data:', error);
    }
  };

  const handleAddBatteryRecord = async () => {
    if (!newBattery.batteryId || !newBattery.voltage) {
      alert('Please fill in required fields (Battery ID and Voltage)');
      return;
    }

    try {
      const batteryRecord = {
        ...newBattery,
        voltage: parseFloat(newBattery.voltage),
        current: parseFloat(newBattery.current) || 0,
        temperature: parseFloat(newBattery.temperature) || 0,
        cycleCount: batteryData.filter(b => b.batteryId === newBattery.batteryId).length + 1
      };

      await addBatteryRecord(batteryRecord);
      await refreshBatteryData();
      
      setNewBattery({
        batteryId: '',
        voltage: '',
        current: '',
        temperature: '',
        status: 'idle',
        location: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding battery record:', error);
      alert('Failed to add battery record. Please try again.');
    }
  };

  const handleStartCompetition = () => {
    if (!isSetupComplete) {
      alert('Please enter both Competition Key and Team Number');
      return;
    }
    
    loadAllData();
    setActiveTab('overview');
  };

  const toggleLiveUpdates = () => {
    if (isLive) {
      liveUpdateManager.stopLiveUpdates();
      setIsLive(false);
    } else {
      const updateCallbacks = {
        matches: async () => {
          const data = await fetchEventMatches(eventKey);
          setMatches(data || []);
        },
        rankings: async () => {
          const data = await fetchEventRankings(eventKey);
          setRankings(data?.rankings || []);
        },
        liveData: async () => {
          const data = await fetchLiveEventData(eventKey);
          setLiveEventData(data);
        },
        teamEPA: async () => {
          const teamMatches = await fetchTeamMatches(eventKey, teamNumber);
          if (teamMatches) {
            const epaData = await calculateEnhancedEPA(teamNumber, eventKey, teamMatches);
            setTeamEPA(epaData);
          }
        },
        statbotics: async () => {
          const data = await fetchStatboticsTeamData(teamNumber);
          setStatboticsData(data);
        }
      };
      
      liveUpdateManager.startLiveUpdates(updateCallbacks, eventKey, teamNumber, 10000);
      setIsLive(true);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (isLive) {
        setLastUpdate(new Date());
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isLive]);

  useEffect(() => {
    return () => {
      liveUpdateManager.stopLiveUpdates();
    };
  }, []);

  const teamRanking = rankings.find(r => r.team_key === `frc${teamNumber}`);
  const teamMatches = matches.filter(match => 
    match.alliances?.red?.team_keys?.includes(`frc${teamNumber}`) ||
    match.alliances?.blue?.team_keys?.includes(`frc${teamNumber}`)
  );
  const nextMatch = teamMatches.find(match => !match.actual_time);

  const filteredBatteryData = batteryData.filter(battery => {
    if (batteryFilter === 'all') return true;
    const status = getBatteryStatus(battery);
    return status === batteryFilter;
  });

  const TabButton = ({ id, label, icon: Icon, disabled = false }: { 
    id: string; 
    label: string; 
    icon: any; 
    disabled?: boolean;
  }) => (
    <button
      onClick={() => !disabled && setActiveTab(id)}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
        disabled 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : activeTab === id 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
      }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">NARPit Dashboard</h1>
            <div className="flex items-center gap-4">
              {isSetupComplete && (
                <>
                  <div className="flex items-center gap-2">
                    <Wifi className={isLive ? 'text-green-500' : 'text-red-500'} size={20} />
                    <button
                      onClick={toggleLiveUpdates}
                      className={`px-3 py-1 rounded text-sm font-medium transition ${
                        isLive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {isLive ? 'LIVE' : 'OFFLINE'}
                    </button>
                  </div>
                  <button
                    onClick={loadAllData}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                </>
              )}
              <div className="text-sm text-gray-600">
                {isSetupComplete && (
                  <>Event: {eventKey} | Team: {teamNumber}</>
                )}
                {lastUpdate && (
                  <div className="text-xs text-gray-500">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <TabButton id="setup" label="Setup" icon={Zap} />
          <TabButton id="overview" label="Overview" icon={Trophy} disabled={!isSetupComplete} />
          <TabButton id="matches" label="Live Matches" icon={Clock} disabled={!isSetupComplete} />
          <TabButton id="rankings" label="Rankings" icon={Users} disabled={!isSetupComplete} />
          <TabButton id="battery" label="Battery Tracking" icon={Battery} />
          <TabButton id="stream" label="Live Stream" icon={Wifi} disabled={!isSetupComplete} />
        </div>

        {activeTab === 'setup' && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8">Competition Setup</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Competition Key
                  </label>
                  <input
                    type="text"
                    value={eventKey}
                    onChange={(e) => setEventKey(e.target.value)}
                    placeholder="e.g., 2025galileo"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Find event keys on The Blue Alliance</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Number
                  </label>
                  <input
                    type="text"
                    value={teamNumber}
                    onChange={(e) => setTeamNumber(e.target.value)}
                    placeholder="e.g., 3128"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleStartCompetition}
                  disabled={!isSetupComplete || isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : 'EMBARK!'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overview' && isSetupComplete && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="text-yellow-500" />
                Team Ranking
              </h3>
              {teamRanking ? (
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    #{teamRanking.rank}
                  </div>
                  <div className="text-gray-600">Current Rank</div>
                  <div className="text-sm text-gray-500 mt-2">
                    {teamRanking.record.wins}-{teamRanking.record.losses}-{teamRanking.record.ties}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center">No ranking data available</div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="text-purple-500" />
                Team EPA
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {teamEPA.overall}
                </div>
                <div className="text-gray-600">
                  {teamEPA.source === 'statbotics' ? 'Statbotics EPA' : 'Estimated EPA'}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Auto: {teamEPA.auto} | Teleop: {teamEPA.teleop} | End: {teamEPA.endgame}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Battery className="text-green-500" />
                Battery Status
              </h3>
              <div className="space-y-2">
                {Object.keys(batteryStats).length > 0 ? Object.entries(batteryStats).slice(0, 3).map(([id, stats]: [string, any]) => (
                  <div key={id} className="flex justify-between items-center">
                    <span className="text-sm">{id}</span>
                    <span className={`text-sm font-medium ${
                      stats.status === 'critical' ? 'text-red-600' : 
                      stats.status === 'warning' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {stats.currentVoltage.toFixed(1)}V
                    </span>
                  </div>
                )) : (
                  <div className="text-gray-500 text-center">No battery data</div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="text-blue-500" />
                Next Match
              </h3>
              {nextMatch ? (
                <div className="text-center">
                  <div className="text-xl font-bold">
                    Match {nextMatch.match_number}
                  </div>
                  <div className="text-gray-600">{nextMatch.comp_level.toUpperCase()}</div>
                  <div className="text-sm text-gray-500 mt-2">
                    {nextMatch.time ? formatTime(nextMatch.time) : 'Time TBD'}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center">No upcoming matches</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'matches' && isSetupComplete && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Live Match Updates</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {isLive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                  Auto-updating: {isLive ? 'ON' : 'OFF'}
                </div>
              </div>
            </div>
            <div className="p-6">
              {matches && matches.length > 0 ? matches.slice(0, 15).map(match => (
                <div key={match.key} className="border-b last:border-b-0 py-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold">
                      {match.comp_level.toUpperCase()} {match.match_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      {match.actual_time ? (
                        <span className="text-green-600">Completed: {formatTime(match.actual_time)}</span>
                      ) : match.time ? (
                        <span>Scheduled: {formatTime(match.time)}</span>
                      ) : (
                        'Time TBD'
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded ${
                      match.winning_alliance === 'red' 
                        ? 'bg-red-100 border-2 border-red-300' 
                        : 'bg-red-50'
                    }`}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium text-red-700">Red Alliance</div>
                        <div className="font-bold text-red-700">
                          {match.alliances?.red?.score || 0}
                        </div>
                      </div>
                      <div className="text-sm">
                        {match.alliances?.red?.team_keys?.map(key => 
                          key.replace('frc', '')
                        ).join(', ') || 'Teams TBD'}
                      </div>
                    </div>
                    <div className={`p-3 rounded ${
                      match.winning_alliance === 'blue' 
                        ? 'bg-blue-100 border-2 border-blue-300' 
                        : 'bg-blue-50'
                    }`}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-medium text-blue-700">Blue Alliance</div>
                        <div className="font-bold text-blue-700">
                          {match.alliances?.blue?.score || 0}
                        </div>
                      </div>
                      <div className="text-sm">
                        {match.alliances?.blue?.team_keys?.map(key => 
                          key.replace('frc', '')
                        ).join(', ') || 'Teams TBD'}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No match data available</p>
                  <p className="text-sm">Check your event key and try refreshing</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'rankings' && isSetupComplete && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Event Rankings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Record (W-L-T)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rankings && rankings.length > 0 ? rankings.slice(0, 30).map(ranking => (
                    <tr 
                      key={ranking.team_key} 
                      className={ranking.team_key === `frc${teamNumber}` ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ranking.rank}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ranking.team_key.replace('frc', '')}
                        {ranking.team_key === `frc${teamNumber}` && (
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">YOU</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ranking.record.wins}-{ranking.record.losses}-{ranking.record.ties}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ranking.qual_average?.toFixed(1) || 'N/A'}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No ranking data available</p>
                        <p className="text-sm">Check your event key and try refreshing</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'battery' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Add Battery Record</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Battery ID (required)"
                  value={newBattery.batteryId}
                  onChange={(e) => setNewBattery({...newBattery, batteryId: e.target.value})}
                  className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Voltage (V) (required)"
                  step="0.1"
                  value={newBattery.voltage}
                  onChange={(e) => setNewBattery({...newBattery, voltage: e.target.value})}
                  className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Current (A)"
                  step="0.1"
                  value={newBattery.current}
                  onChange={(e) => setNewBattery({...newBattery, current: e.target.value})}
                  className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Temperature (°C)"
                  step="0.1"
                  value={newBattery.temperature}
                  onChange={(e) => setNewBattery({...newBattery, temperature: e.target.value})}
                  className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newBattery.status}
                  onChange={(e) => setNewBattery({...newBattery, status: e.target.value as any})}
                  className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="idle">Idle</option>
                  <option value="charging">Charging</option>
                  <option value="discharging">Discharging</option>
                </select>
                <input
                  type="text"
                  placeholder="Location"
                  value={newBattery.location}
                  onChange={(e) => setNewBattery({...newBattery, location: e.target.value})}
                  className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={newBattery.notes}
                  onChange={(e) => setNewBattery({...newBattery, notes: e.target.value})}
                  className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddBatteryRecord}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Battery size={20} />
                  Add Record
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-green-600">
                  <Battery size={20} />
                  Active Batteries
                </h3>
                <div className="text-2xl font-bold">
                  {Object.keys(batteryStats).length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-yellow-600">
                  <AlertCircle size={20} />
                  Warnings
                </h3>
                <div className="text-2xl font-bold">
                  {Object.values(batteryStats).filter((s: any) => s.status === 'warning').length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-red-600">
                  <AlertCircle size={20} />
                  Critical
                </h3>
                <div className="text-2xl font-bold">
                  {Object.values(batteryStats).filter((s: any) => s.status === 'critical').length}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">Battery Records</h2>
                <button
                  onClick={refreshBatteryData}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Battery ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voltage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Temp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {batteryData && batteryData.length > 0 ? batteryData.slice().reverse().map(battery => {
                      const status = getBatteryStatus(battery);
                      return (
                        <tr key={battery.id} className={
                          status === 'critical' ? 'bg-red-50 border-l-4 border-red-500' : 
                          status === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''
                        }>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDateTime(battery.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {battery.batteryId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={getBatteryStatusColor(battery)}>
                              {battery.voltage}V
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {battery.current}A
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {battery.temperature}°C
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              battery.status === 'charging' ? 'bg-green-100 text-green-800' :
                              battery.status === 'discharging' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {battery.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {battery.location || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {battery.notes || '-'}
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                          <Battery size={48} className="mx-auto mb-4 opacity-50" />
                          <p>No battery records yet</p>
                          <p className="text-sm">Add your first record above!</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stream' && isSetupComplete && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Live Competition Stream</h2>
              <p className="text-gray-600 text-sm mt-1">
                Event: {eventKey} | Team: {teamNumber}
              </p>
            </div>
            <div className="p-6">
              <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
                {streamUrl ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={streamUrl.url}
                    title="Live Competition Stream"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0"
                  ></iframe>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-900">
                    <div className="text-center">
                      <Wifi size={64} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Live Competition Stream</p>
                      <p className="text-sm opacity-75 mb-4">
                        Stream will appear here during competition
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Stream Information</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Event: {eventKey}</p>
                    <p>Team Focus: {teamNumber}</p>
                    <p>Status: {isLive ? 'Live Updates Active' : 'Offline Mode'}</p>
                    {streamUrl && (
                      <p>Source: {streamUrl.type === 'youtube' ? 'YouTube' : streamUrl.type === 'twitch' ? 'Twitch' : 'Direct'}</p>
                    )}
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveTab('matches')}
                      className="w-full px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition"
                    >
                      View Live Matches
                    </button>
                    <button
                      onClick={() => setActiveTab('rankings')}
                      className="w-full px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition"
                    >
                      Check Rankings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}