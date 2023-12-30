import React, {useState, useEffect} from 'react';
import {
  PermissionsAndroid,
  FlatList,
  TouchableOpacity,
  ToastAndroid,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
} from 'react-native';
import BluetoothSerial from 'react-native-bluetooth-serial-next';
import _ from 'lodash';
import LoadingAnimation from '../components/loading.component';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCompactDisc} from '@fortawesome/free-solid-svg-icons';

const BluetoothList = ({navigation}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [unpairedDevices, setUnpairedDevices] = useState([]);
  const [inputText, setInputText] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const enableBluetooth = async () => {
      try {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ];

        const granted = await PermissionsAndroid.requestMultiple(permissions);

        if (
          granted['android.permission.BLUETOOTH_CONNECT'] ===
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Bluetooth Connect Permission granted');
        } else {
          console.log('Bluetooth Connect Permission denied');
        }

        if (
          granted['android.permission.BLUETOOTH_SCAN'] ===
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Bluetooth Scan Permission granted');
        } else {
          console.log('Bluetooth Scan Permission denied');
        }

        if (
          granted['android.permission.ACCESS_FINE_LOCATION'] ===
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Fine Location Permission granted');
        } else {
          console.log('Fine Location Permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    };

    const intervalId = setInterval(async () => {
      try {
        const data = await BluetoothSerial.readFromDevice();
        if (data) {
          // Check if data is available
          console.log('Received data:', data);
          // Process the received data here
        }
      } catch (error) {
        console.error('Error reading data:', error);
      }
    }, 500);

    BluetoothSerial.on = (eventName, handler) => {
      DeviceEventEmitter.addListener(eventName, handler);
    };

    const fetchBluetoothInfo = async () => {
      try {
        const [enabled, deviceList] = await Promise.all([
          BluetoothSerial.isEnabled(),
          BluetoothSerial.list(),
        ]);

        setIsEnabled(enabled);
        setDevices(deviceList);

        BluetoothSerial.on('bluetoothEnabled', async () => {
          const [isEnabledAfterEnable, devicesAfterEnable] = await Promise.all([
            BluetoothSerial.isEnabled(),
            BluetoothSerial.list(),
          ]);

          setIsEnabled(isEnabledAfterEnable);
          setDevices(devicesAfterEnable);
        });

        BluetoothSerial.on('bluetoothDisabled', () => {
          setDevices([]);
          setIsEnabled(false);
          setConnected(false);
        });

        BluetoothSerial.on('error', err =>
          console.log(`Error: ${err.message}`),
        );
      } catch (error) {
        console.error(error.message);
      }
    };

    enableBluetooth();
    fetchBluetoothInfo();
    return () => clearInterval(intervalId);
  }, []);

  const connect = async device => {
    setConnecting(true);

    try {
      await BluetoothSerial.connect(device.id);
      console.log(`Connected to device ${device.name}`);
      ToastAndroid.show(
        `Connected to device ${device.name}`,
        ToastAndroid.SHORT,
      );
      setConnected(true);
      if (connected) {
        navigation.navigate('Home', {device});
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setConnecting(false);
    }
  };

  const renderItem = ({item}) => (
    <TouchableOpacity onPress={() => connect(item)}>
      <View style={styles.deviceNameWrap}>
        <FontAwesomeIcon
          icon={faCompactDisc}
          color="blue"
          style={styles.icon}
          size={20}
        />
        <Text style={styles.deviceName}>{item.name ? item.name : item.id}</Text>
      </View>
    </TouchableOpacity>
  );

  const transferData = async () => {
    try {
      // Check if connected to a Bluetooth device
      if (connected) {
        // Send data
        await BluetoothSerial.write(inputText);
        console.log('Data transferred successfully:', inputText);
        setInputText('');
      } else {
        console.log('Not connected to a Bluetooth device.');
      }
    } catch (error) {
      console.error('Error transferring data:', error);
    }
  };

  const discoverAvailableDevices = () => {
    if (discovering) {
      return;
    } else {
      setDiscovering(true);

      BluetoothSerial.discoverUnpairedDevices()
        .then(unpairedDevices => {
          const uniqueDevices = _.uniqBy(unpairedDevices, 'id');

          setDevices(prevDevices => [...prevDevices, ...uniqueDevices]);
        })
        .catch(err => {
          console.log(err.message);
          // Make sure to set discovering to false in case of an error
          setDiscovering(false);
        });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>Bluetooth Device List</Text>
        <Text style={styles.toolbarStatus}>
          {connected ? 'Conneted' : 'Not Connected'}
        </Text>
      </View>
      <Pressable
        onPress={discoverAvailableDevices}
        style={styles.toolbarButton}>
        <Text style={styles.buttonText}>Scan for Devices</Text>
      </Pressable>
      <View style={styles.listContainer}>
        {isEnabled && (
          <FlatList
            style={{flex: 1}}
            data={devices}
            keyExtractor={item => item.id}
            renderItem={renderItem}
          />
        )}
      </View>
      <View>
        <TextInput
          style={styles.input}
          placeholder="Enter text here"
          onChangeText={text => setInputText(text)}
          value={inputText}
        />
        <Pressable onPress={transferData} style={styles.toolbarButton}>
          <Text style={styles.buttonText}>Send Data</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  toolbar: {
    paddingTop: 30,
    paddingBottom: 30,
    flexDirection: 'row',
  },
  toolbarButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  toolbarTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    flex: 1,
    marginTop: 6,
  },
  deviceName: {
    fontSize: 20,
    color: 'black',
    textAlign: 'center',
  },
  toolbarStatus: {
    textAlign: 'center',
    fontSize: 15,
    flex: 1,
    marginTop: 6,
  },
  deviceNameWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    marginLeft: 20,
  },
  listContainer: {
    flex: 1,
    position: 'relative',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    width: '100%',
    margin: 20,
  },
});

export default BluetoothList;
