import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const NEWS_FEED = [
  "⚠️ MARS KOLONİSİ İLE İLETİŞİM KESİLDİ - SON SİNYAL: 'ONLAR UYANDI'",
  "🌐 NETWATCH UYARISI: ROGUE AI 'LILITH' 7. BÖLGEDE TESPİT EDİLDİ",
  "💉 TRAUMA TEAM PREMIUM ÜYELİK ARTIK %20 İNDİRİMLİ",
  "🧬 BIOTECHNICA YENİ 'SENTIENT' EVCİL HAYVAN SERİSİNİ TANITTI",
  "💰 EURO-DOLLAR PARİTESİ ÇÖKTÜ - YENİ PARA BİRİMİ: 'DATA-SHARDS'",
  "🤖 ARASAKA KULESİ'NDE PATLAMA - 'SAMURAI' ÜSTLENDİ",
  "🌧️ NIGHT CITY HAVA DURUMU: ASİT YAĞMURLARI BEKLENİYOR",
  "🧠 BRAINDANCE BAĞIMLILIĞI ARTIYOR - YENİ REHABİLİTASYON MERKEZLERİ",
  "🚀 SPACE-X 9 ROKETİ SATURN HALKALARINDAN GİZEMLİ BİR NESNE GETİRDİ",
  "👁️ OPTİK IMPLANTLARDA GÜVENLİK AÇIĞI - GÖRDÜKLERİNİZ KAYDEDİLİYOR",
  "⚡ YENİ SİBER-PUNK ÇETESİ 'NEON GHOSTS' ŞEHİR MERKEZİNİ ELE GEÇİRDİ",
  "🧊 KÜRESEL ISINMA SONA ERDİ - NÜKLEER KIŞ BAŞLADI",
  "🛰️ YÖRÜNGE İSTASYONU 'HELIOS' DÜNYAYA DÜŞÜYOR",
  "💊 'CHROME' HASTALIĞI İÇİN YENİ İLAÇ BULUNDU",
  "🎵 DJ SİLVERHAND BU GECE AFTERLIFE'DA - GİRİŞ SADECE SİBER-KOLLULARA",
  "📡 6G AĞLARI ÇÖKTÜ - ESKİ RADYO FREKANSLARI GERİ DÖNDÜ",
  "🚔 NCPD: 'PSYCHO-SQUAD' EKİPLERİ YETERSİZ KALIYOR",
  "🔋 ENERJİ KRİZİ KAPIDA - ŞEHRİN YARISI KARANLIKTA",
  "👽 SETI PROJESİ: 'WOW!' SİNYALİNİN KAYNAĞI YAPAY BİR YAPI OLABİLİR",
  "🕹️ SİBER-OLİMPİYATLAR BAŞLIYOR"
];

const TickerItem = ({ theme }) => (
  <View style={styles.itemRow}>
    {NEWS_FEED.map((item, index) => (
      <View key={index} style={styles.itemContainer}>
        <Text style={[styles.tickerText, { color: theme.primary }]}>{item}</Text>
        <Text style={[styles.separator, { color: theme.accent }]}>///</Text>
      </View>
    ))}
  </View>
);

const CyberTicker = () => {
  const { theme, newsTickerEnabled, terminalModeEnabled } = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [contentWidth, setContentWidth] = useState(0);

  useEffect(() => {
    if (!newsTickerEnabled || terminalModeEnabled || contentWidth === 0) return;

    const duration = contentWidth * 20; // Speed: 20ms per pixel

    const animate = () => {
      scrollX.setValue(0);
      Animated.timing(scrollX, {
        toValue: -contentWidth, // Scroll exactly the width of one set
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) animate();
      });
    };

    animate();
  }, [newsTickerEnabled, terminalModeEnabled, contentWidth]);

  if (!newsTickerEnabled || terminalModeEnabled) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderTopColor: theme.cardBorder, borderBottomColor: theme.cardBorder }]}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: theme.bg, backgroundColor: theme.primary }]}>NEWS</Text>
      </View>
      
      <View style={styles.mask}>
        {/* Hidden View to Measure Width */}
        <View 
          style={{ position: 'absolute', opacity: 0, flexDirection: 'row' }}
          onLayout={(e) => setContentWidth(e.nativeEvent.layout.width)}
        >
          <TickerItem theme={theme} />
        </View>

        {/* Visible Animated View (2 Copies) */}
        {contentWidth > 0 && (
          <Animated.View 
            style={{ 
              flexDirection: 'row',
              transform: [{ translateX: scrollX }]
            }}
          >
            <TickerItem theme={theme} />
            <TickerItem theme={theme} />
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 32,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  labelContainer: {
    zIndex: 10,
    height: '100%',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 8,
    height: '100%',
    textAlignVertical: 'center',
    lineHeight: 30, 
  },
  mask: {
    flex: 1,
    overflow: 'hidden', 
    flexDirection: 'row', // Ensure children are row based
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20, 
  },
  tickerText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textTransform: 'uppercase',
  },
  separator: {
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 10,
    opacity: 0.7,
  }
});

export default CyberTicker;