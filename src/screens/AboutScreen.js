import React from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const AboutScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  const rawHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        body { 
          margin: 0; padding: 0; 
          width: 100vw; height: 100vh; 
          background-color: #000; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          overflow: hidden;
          perspective: 1200px;
          font-family: monospace;
        }

        /* --- THE ORIGINAL TESSERACT (RESTORED) --- */
        .scene {
          width: 200px; height: 200px;
          transform-style: preserve-3d;
          animation: float 6s ease-in-out infinite;
          transition: transform 1s ease;
        }
        
        .cube {
          width: 100%; height: 100%;
          position: absolute;
          transform-style: preserve-3d;
          animation: rotate 20s linear infinite;
        }

        .cube-inner {
          width: 50%; height: 50%;
          position: absolute;
          top: 25%; left: 25%;
          transform-style: preserve-3d;
          animation: rotate-reverse 10s linear infinite;
        }

        .face {
          position: absolute;
          width: 200px; height: 200px;
          border: 2px solid ${theme.primary};
          opacity: 0.6;
          background: rgba(0, 255, 255, 0.05);
          box-shadow: 0 0 15px ${theme.primary};
        }
        
        .face-inner {
          position: absolute;
          width: 100px; height: 100px;
          border: 2px solid ${theme.accent};
          opacity: 0.8;
          background: rgba(255, 0, 255, 0.1);
          box-shadow: 0 0 10px ${theme.accent};
        }

        .front  { transform: rotateY(0deg) translateZ(100px); }
        .back   { transform: rotateY(180deg) translateZ(100px); }
        .right  { transform: rotateY(90deg) translateZ(100px); }
        .left   { transform: rotateY(-90deg) translateZ(100px); }
        .top    { transform: rotateX(90deg) translateZ(100px); }
        .bottom { transform: rotateX(-90deg) translateZ(100px); }

        .i-front  { transform: rotateY(0deg) translateZ(50px); }
        .i-back   { transform: rotateY(180deg) translateZ(50px); }
        .i-right  { transform: rotateY(90deg) translateZ(50px); }
        .i-left   { transform: rotateY(-90deg) translateZ(50px); }
        .i-top    { transform: rotateX(90deg) translateZ(50px); }
        .i-bottom { transform: rotateX(-90deg) translateZ(50px); }

        @keyframes rotate { 0% { transform: rotate3d(1,1,1,0deg); } 100% { transform: rotate3d(1,1,1,360deg); } }
        @keyframes rotate-reverse { 0% { transform: rotate3d(1,1,1,360deg); } 100% { transform: rotate3d(1,1,1,0deg); } }
        @keyframes float { 0%, 100% { transform: translateY(-20px); } 50% { transform: translateY(20px); } }

        /* --- GEOMETRIC DATA PLATES (The High-Dimensional Flow) --- */
        .data-stream {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none;
            transform-style: preserve-3d;
            z-index: 10;
        }

        .plate {
            position: absolute;
            top: 50%; left: 50%;
            width: 260px;
            padding: 15px;
            background: rgba(0, 0, 0, 0.8);
            border-left: 4px solid ${theme.primary};
            border-right: 4px solid ${theme.accent};
            color: #fff;
            opacity: 0;
            display: flex; flex-direction: column; align-items: center;
            transform-style: preserve-3d;
            box-shadow: 0 0 30px rgba(0,0,0,0.5);
        }

        .plate h2 { margin: 0; font-size: 18px; letter-spacing: 5px; color: ${theme.primary}; }
        .plate p { margin: 5px 0 0; font-size: 11px; letter-spacing: 2px; color: ${theme.textSec}; }

        /* Active State Animation */
        .plate.active {
            animation: plate-flow 3s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }

        @keyframes plate-flow {
            0% { transform: translate(-50%, -50%) translateZ(-1000px) rotateX(90deg); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; transform: translate(-50%, -50%) translateZ(100px) rotateX(0deg); }
            100% { transform: translate(-50%, -50%) translateZ(500px) rotateX(-90deg); opacity: 0; }
        }

        /* --- SCANLINES & HUD --- */
        .scanline {
            position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3) 51%);
            background-size: 100% 4px; pointer-events: none; z-index: 99;
        }

        #hint {
            position: absolute; bottom: 40px; width: 100%; text-align: center;
            color: ${theme.primary}; font-size: 10px; letter-spacing: 2px;
            animation: blink 1s infinite;
        }
        @keyframes blink { 50% { opacity: 0.3; } }

        body.busy .scene { transform: scale(0.6) rotateY(45deg); opacity: 0.3; }
      </style>
    </head>
    <body>
      <div class="scanline"></div>
      
      <!-- THE CORE CUBE -->
      <div class="scene" id="tesseract">
        <div class="cube">
          <div class="face front"></div><div class="face back"></div><div class="face right"></div>
          <div class="face left"></div><div class="face top"></div><div class="face bottom"></div>
        </div>
        <div class="cube-inner">
          <div class="face-inner i-front"></div><div class="face-inner i-back"></div><div class="face-inner i-right"></div>
          <div class="face-inner i-left"></div><div class="face-inner i-top"></div><div class="face-inner i-bottom"></div>
        </div>
      </div>

      <!-- DATA OVERLAY -->
      <div class="data-stream">
        <div class="plate" id="plate">
            <h2 id="p-title">LOADING</h2>
            <p id="p-desc">INITIALIZING...</p>
        </div>
      </div>

      <div id="hint">TAP TO ACCESS CORE DATA</div>

      <script>
        const info = [
            { t: "GLASSBOOK", d: "NEURAL NOTE INTERFACE v1.5" },
            { t: "ARCHITECT", d: "DESIGNED & CODED BY MELIH" },
            { t: "ENGINE", d: "RICCI FLOW GEOMETRY CORE" },
            { t: "STATUS", d: "SYSTEM NOMINAL // ACCESS GRANTED" }
        ];

        let idx = 0;
        let busy = false;

        document.body.addEventListener('click', () => {
            if (busy) return;
            busy = true;
            
            document.body.classList.add('busy');
            document.getElementById('hint').style.display = 'none';
            
            const plate = document.getElementById('plate');
            const title = document.getElementById('p-title');
            const desc = document.getElementById('p-desc');

            const showInfo = () => {
                if (idx >= info.length) {
                    idx = 0;
                    busy = false;
                    document.body.classList.remove('busy');
                    document.getElementById('hint').style.display = 'block';
                    return;
                }

                // Set Data
                title.innerText = info[idx].t;
                desc.innerText = info[idx].d;
                
                // Trigger Animation
                plate.classList.remove('active');
                void plate.offsetWidth; // Force reflow
                plate.classList.add('active');
                
                window.ReactNativeWebView.postMessage("TICK");

                idx++;
                setTimeout(showInfo, 3200); // Wait for animation to finish
            };

            showInfo();
        });
      </script>
    </body>
    </html>
  `;
  
  const source = { uri: 'data:text/html;charset=utf-8,' + encodeURIComponent(rawHtml) };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar hidden />
      <WebView
        originWhitelist={['*']}
        source={source} 
        style={{ flex: 1, backgroundColor: '#000' }}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      />
      
      <TouchableOpacity 
        style={styles.backBtn}
        onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            navigation.goBack();
        }}
      >
        <Ionicons name="close" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  backBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 20
  }
});

export default AboutScreen;
