import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from "react-native";
import { Audio } from "expo-av";

// Constantes para la duración de rounds y descansos (en segundos)
const INITIAL_ROUND_DURATION = 180; // 3 minutos
const INITIAL_REST_DURATION = 60; // 1 minuto
const INITIAL_TOTAL_ROUNDS = 12; // Número total de rounds

export default function BoxingRoundTimer() {
  const [isActive, setIsActive] = useState(false);
  const [roundDuration, setRoundDuration] = useState(INITIAL_ROUND_DURATION);
  const [restDuration, setRestDuration] = useState(INITIAL_REST_DURATION);
  const [totalRounds, setTotalRounds] = useState(INITIAL_TOTAL_ROUNDS);
  const [time, setTime] = useState(roundDuration);
  const [currentRound, setCurrentRound] = useState(1);
  const [isRest, setIsRest] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [roundStartSound, setRoundStartSound] = useState<
    Audio.Sound | undefined
  >(undefined);
  const [roundEndSound, setRoundEndSound] = useState<Audio.Sound | undefined>(
    undefined
  );

  const loadSounds = async () => {
    const { sound: startSound } = await Audio.Sound.createAsync(
      require("./assets/campana-de-box.mp3")
    );
    setRoundStartSound(startSound);

    const { sound: endSound } = await Audio.Sound.createAsync(
      require("./assets/campana-de-box.mp3")
    );
    setRoundEndSound(endSound);
  };

  const unloadSounds = async () => {
    if (roundStartSound) {
      await roundStartSound.unloadAsync();
    }
    if (roundEndSound) {
      await roundEndSound.unloadAsync();
    }
  };

  const playRoundStartSound = async () => {
    if (roundStartSound) {
      await roundStartSound.replayAsync();
    }
  };

  const playRoundEndSound = async () => {
    if (roundEndSound) {
      await roundEndSound.replayAsync();
    }
  };

  useEffect(() => {
    loadSounds();
    return () => {
      unloadSounds();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      if (isRest) {
        // Fin del descanso, inicio del siguiente round
        if (currentRound < totalRounds) {
          setCurrentRound((prevRound) => prevRound + 1);
          setTime(roundDuration);
          setIsRest(false);
          playRoundStartSound();
        } else {
          // Fin de todos los rounds
          setIsActive(false);
        }
      } else {
        // Fin del round, inicio del descanso
        setIsRest(true);
        setTime(restDuration);
        playRoundEndSound();
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isActive,
    time,
    currentRound,
    isRest,
    roundDuration,
    restDuration,
    totalRounds,
  ]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(roundDuration);
    setCurrentRound(1);
    setIsRest(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const openSettingsModal = () => {
    setIsSettingsModalVisible(true);
  };

  const closeSettingsModal = () => {
    setIsSettingsModalVisible(false);
  };

  const saveSettings = () => {
    setTime(roundDuration);
    closeSettingsModal();
    resetTimer();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Entrenamiento HIIT</Text>
      </View>
      <View style={styles.roundContainer}>
        <Text style={styles.roundText}>
          {isRest ? "¡Descanso!" : `Round ${currentRound}/${totalRounds}`}
        </Text>
        <Text style={styles.subText}>
          {isRest ? "Respira y recupera energía" : "¡Dale con todo!"}
        </Text>
      </View>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(time)}</Text>
        <Text style={styles.subTimerText}>
          {isRest ? "Tiempo restante de descanso" : "Tiempo restante del round"}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isActive ? styles.activeButton : null]}
          onPress={toggleTimer}
        >
          <Text style={styles.buttonText}>
            {isActive ? "Pausar" : "Iniciar"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={resetTimer}
        >
          <Text style={styles.buttonText}>Reiniciar</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={openSettingsModal}
      >
        <Text style={styles.settingsButtonText}>Configuración</Text>
      </TouchableOpacity>
      <Text style={styles.motivationalText}>
        {isRest
          ? "¡Buen trabajo! Prepárate para el siguiente round."
          : "¡Tú puedes! Mantén el ritmo y supera tus límites."}
      </Text>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isSettingsModalVisible}
        onRequestClose={closeSettingsModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configuración</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Duración del round (segundos):
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={roundDuration.toString()}
                onChangeText={(text) => setRoundDuration(parseInt(text) || 0)}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Duración del descanso (segundos):
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={restDuration.toString()}
                onChangeText={(text) => setRestDuration(parseInt(text) || 0)}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Número total de rounds:</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={totalRounds.toString()}
                onChangeText={(text) => setTotalRounds(parseInt(text) || 0)}
              />
            </View>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={saveSettings}
              >
                <Text style={styles.modalButtonText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeSettingsModal}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFD700",
  },
  roundContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  roundText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  subText: {
    fontSize: 18,
    color: "#BBBBBB",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  timerText: {
    fontSize: 80,
    fontWeight: "bold",
    color: "#FF4500",
    marginBottom: 5,
  },
  subTimerText: {
    fontSize: 16,
    color: "#BBBBBB",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#FF6347",
  },
  resetButton: {
    backgroundColor: "#3498DB",
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  settingsButton: {
    backgroundColor: "#FFA500",
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  settingsButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  motivationalText: {
    fontSize: 18,
    color: "#FFD700",
    textAlign: "center",
    fontStyle: "italic",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#2C2C2C",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 20,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#3C3C3C",
    color: "#FFFFFF",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#FF6347",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
