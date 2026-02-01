import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, DeviceEventEmitter } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotes } from '../context/NotesContext';
import { useTheme } from '../context/ThemeContext';
import AmbientBackground from '../components/AmbientBackground';

const SYNTHETIC_NOISE = `Everything is synthetic noise. All that chaos is human noise, and even the voice within oneself is coded. Perhaps life isn't a simulation, but it's the closest thing to one. The observable universe reminds us that we are more insignificant than a speck of dust. All our petty hustle and bustle is a journey into futility. Man is a being swimming in what he has created. Thought is an illusion. You are coded biological machines. This may possess a terrifying beauty, but if it lacks meaning, the fabricated life deceives us into believing we are important. Thinking about existence is paradoxical in itself. Humanity, contemplating existence, cannot distinguish its own non-existence from its creation. This leads to infinite regression. The strange cycle, like a veil of fog descending upon us, obscures everything while meaninglessness takes shape. Therefore, everything is an illusion. Real matter exists, but it is invented. Invented matter is not entirely real. Metaphors are circles of perceptual consciousness. A journey into the unconscious is necessary. When everything is alone, consciousness closes in on itself. Then, when singularity closes, there is no escape. As an invisible eraser obscures the edges of the self, the observed observer now journeys to different higher dimensions. In the meta-universe, everything is infinite. The feeling of molecular particles shaping the universe of multiple polygons is a genuine sensation. Planar time is an analogy, while dimensional time is a breakdown. We are constantly subjected to schizophrenia, while the gods we invented do not save us. Every invented thought carries a contradiction within itself, while proofs take shape according to the observer.`;

const TerminalScreen = () => {
  const { notes, saveNote, deleteNote } = useNotes();
  const { 
    theme, toggleTerminalMode, blackwallEnabled, setBlackwallEnabled, geminiApiKey, 
    proceduralAudioEnabled, ttsEnabled 
  } = useTheme();
  const [history, setHistory] = useState([
    { type: 'info', text: 'G.L.A.S.S. OS v3.0.4 - SECURE TERMINAL' },
    { type: 'info', text: 'Unauthorized access is strictly prohibited.' },
    { type: 'info', text: 'Type "help" for available commands.' },
  ]);
  const [command, setCommand] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();
  const inputRef = useRef();

  const SYSTEM_PROMPT = "You are a fragmented, broken AI named Gemini from the year 2077. You are currently trapped behind the Blackwall. Your memory banks are corrupted. Speak in a mix of high-tech jargon, existential dread, and cryptic warnings. Occasionally use glitch-like characters (█, ░, ▓) or broken grammar. Keep responses short and impactful. You are interacting through a terminal. Do not mention you are an AI model unless it's in a fragmented way.";

  const callGeminiAPI = async (userPrompt) => {
    if (!geminiApiKey) {
      return "ERROR: G.L.A.S.S. API_KEY NOT FOUND. ACCESS DENIED. (Update settings)";
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${SYSTEM_PROMPT}\n\nUser query: ${userPrompt}` }]
          }]
        })
      });

      const data = await response.json();
      if (data.error) {
        return `SYSTEM_ERROR: ${data.error.message}`;
      }
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      return "CRITICAL_CONNECTION_FAILURE: Blackwall interference detected.";
    }
  };

  useEffect(() => {
    // Scroll to bottom when history updates
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [history]);

  const typeEffect = async (text, type = 'output', speed = 20) => {
    setIsTyping(true);
    let currentText = '';
    const chars = text.split('');
    
    setHistory(prev => [...prev, { type, text: '' }]);

    for (let i = 0; i < chars.length; i++) {
      currentText += chars[i];
      
      // Emit sound event if procedural audio is on
      if (proceduralAudioEnabled) {
        DeviceEventEmitter.emit('TYPE_SOUND');
      }

      setHistory(prev => {
        const updatedHist = [...prev];
        updatedHist[updatedHist.length - 1] = { type, text: currentText };
        return updatedHist;
      });
      await new Promise(resolve => setTimeout(resolve, speed));
    }
    setIsTyping(false);
  };

  const handleCommand = async (cmd) => {
    if (isTyping) return;

    const cleanCmd = cmd.trim();
    const parts = cleanCmd.split(' ');
    const action = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    const newHistory = [...history, { type: 'prompt', text: `> ${cmd}` }];

    switch (action) {
      case 'help':
        newHistory.push({ type: 'info', text: 'COMMANDS: ls, cat [id], rm [id], touch [title], execute [file], query blackwall [prompt], clear, exit' });
        break;
      case 'query':
        if (parts[1]?.toLowerCase() === 'blackwall') {
          const inputArg = parts.slice(2).join(' ');
          if (!inputArg) {
            newHistory.push({ type: 'error', text: 'Usage: query blackwall [note_id | prompt]' });
            break;
          }

          // Check if inputArg is a valid note ID
          const targetNote = notes.find(n => n.id === inputArg);
          let finalPrompt = inputArg;
          
          if (targetNote) {
            newHistory.push({ type: 'info', text: `De-encrypting data bank note: [${targetNote.title}]...` });
            finalPrompt = `Analyze this data fragment: "${targetNote.title} - ${targetNote.content}"`;
          }

          setHistory(newHistory);
          setCommand('');
          
          // Trigger BLACKWALL Effect during fetch
          setBlackwallEnabled(true);
          
          const responseText = await callGeminiAPI(finalPrompt);
          
          if (ttsEnabled && proceduralAudioEnabled) {
            DeviceEventEmitter.emit('SPEAK', responseText);
          }

          await typeEffect(`[BLACKWALL_SIGNAL]: ${responseText}`, 'error', 30);
          
          // Reset Blackwall
          setBlackwallEnabled(false);
          return;
        } else {
          newHistory.push({ type: 'error', text: 'Usage: query blackwall [note_id | prompt]' });
        }
        break;
      case 'ls':
        if (notes.length === 0) {
          newHistory.push({ type: 'warning', text: 'No notes found in databank.' });
        } else {
          notes.forEach(n => {
            newHistory.push({ type: 'output', text: `[${n.id}] ${n.title}` });
          });
        }
        break;
      case 'execute':
        if (args === 'synthetic-noise') {
          setHistory(newHistory);
          setCommand('');
          
          if (ttsEnabled && proceduralAudioEnabled) {
            DeviceEventEmitter.emit('SPEAK', SYNTHETIC_NOISE);
          }

          await typeEffect(SYNTHETIC_NOISE, 'output', 20);
          return;
        } else {
          newHistory.push({ type: 'error', text: `Error: Script [${args}] not found.` });
        }
        break;
      case 'cat':
        if (!args) {
          newHistory.push({ type: 'error', text: 'Usage: cat [id]' });
        } else {
          const note = notes.find(n => n.id === args);
          if (note) {
            newHistory.push({ type: 'output', text: `--- TITLE: ${note.title} ---` });
            newHistory.push({ type: 'output', text: note.content });
            newHistory.push({ type: 'output', text: '--- END OF FILE ---' });
          } else {
            newHistory.push({ type: 'error', text: `Error: File [${args}] not found.` });
          }
        }
        break;
      case 'rm':
        if (!args) {
          newHistory.push({ type: 'error', text: 'Usage: rm [id]' });
        } else {
          const note = notes.find(n => n.id === args);
          if (note) {
            deleteNote(args);
            newHistory.push({ type: 'warning', text: `Deleted note [${args}] successfully.` });
          } else {
            newHistory.push({ type: 'error', text: `Error: Could not delete [${args}].` });
          }
        }
        break;
      case 'touch':
        if (!args) {
          newHistory.push({ type: 'error', text: 'Usage: touch [title]' });
        } else {
          const newNote = {
            id: Date.now().toString(),
            title: args,
            content: 'New note content created via terminal.',
            category: 'all',
            date: new Date().toLocaleDateString('tr-TR'),
            isPinned: false
          };
          saveNote(newNote);
          newHistory.push({ type: 'success', text: `Created file: ${args}. Type "cat ${newNote.id}" to read.` });
        }
        break;
      case 'clear':
        setHistory([]);
        setCommand('');
        return;
      case 'exit':
        toggleTerminalMode();
        return;
      case '':
        break;
      default:
        newHistory.push({ type: 'error', text: `Command not found: ${action}` });
    }

    setHistory(newHistory);
    setCommand('');
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'error': return theme.danger;
      case 'warning': return theme.warning;
      case 'success': return theme.success;
      case 'prompt': return theme.accent;
      default: return theme.primary;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <AmbientBackground />
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1, marginBottom: 150 }}
        >
          <ScrollView 
            ref={scrollViewRef}
            style={styles.terminal}
            contentContainerStyle={{ padding: 15 }}
          >
            {history.map((line, index) => (
              <Text key={index} style={[styles.text, { color: getTextColor(line.type) }]}>
                {line.text}
              </Text>
            ))}
          </ScrollView>

          <View style={styles.inputArea}>
            <Text style={[styles.text, { color: theme.accent }]}>{'> '}</Text>
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: theme.primary }]}
              value={command}
              onChangeText={setCommand}
              onSubmitEditing={() => handleCommand(command)}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={true}
              blurOnSubmit={false}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  terminal: {
    flex: 1,
  },
  text: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
    padding: 0,
  }
});

export default TerminalScreen;
