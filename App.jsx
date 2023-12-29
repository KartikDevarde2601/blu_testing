import React, {useState, useEffect} from 'react';
import {
  PermissionsAndroid,
  FlatList,
  Switch,
  TouchableOpacity,
  ToastAndroid,
  Button,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import BluetoothSerial from 'react-native-bluetooth-serial-next';
import _ from 'lodash';

const App = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [devices, setDevices] = useState([]);
  const [unpairedDevices, setUnpairedDevices] = useState([]);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const enableBluetoothAndRequestPermissions = async () => {
    try {
      await BluetoothSerial.requestPermission();
      await BluetoothSerial.requestEnable();
    } catch (error) {
      console.error(error.message);
    }
  };

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

  useEffect(() => {
    enableBluetooth();

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
        });

        BluetoothSerial.on('error', err =>
          console.log(`Error: ${err.message}`),
        );
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchBluetoothInfo();
  }, []);

  const connect = device => {
    setConnecting(true);

    BluetoothSerial.connect(device.id)
      .then(() => {
        console.log(`Connected to device ${device.name}`);
        ToastAndroid.show(
          `Connected to device ${device.name}`,
          ToastAndroid.SHORT,
        );
      })
      .catch(err => console.log(err.message))
      .finally(() => setConnecting(false));
  };

  const renderItem = ({item}) => (
    <TouchableOpacity onPress={() => connect(item)}>
      <View style={styles.deviceNameWrap}>
        <Text style={styles.deviceName}>{item.name ? item.name : item.id}</Text>
      </View>
    </TouchableOpacity>
  );

  const enable = () => {
    BluetoothSerial.enable()
      .then(() => setIsEnabled(true))
      .catch(err => console.error(err.message));
  };

  const disable = () => {
    BluetoothSerial.disable()
      .then(() => setIsEnabled(false))
      .catch(err => console.error(err.message));
  };

  const toggleBluetooth = value => {
    if (value === true) {
      enable();
    } else {
      disable();
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
          console.log(uniqueDevices);
          setUnpairedDevices(uniqueDevices);
          setDiscovering(false);
        })
        .catch(err => console.log(err.message));
    }
  };

  const toggleSwitch = () => {
    BluetoothSerial.write('T')
      .then(() => {
        console.log('Successfully wrote to device');
        setConnected(true);
      })
      .catch(err => console.log(err.message));
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>Bluetooth Device List</Text>
        <View style={styles.toolbarButton}>
          <Switch
            value={isEnabled}
            onValueChange={val => toggleBluetooth(val)}
          />
        </View>
      </View>
      <Button
        onPress={discoverAvailableDevices}
        title="Scan for Devices"
        color="#841584"
      />
      <FlatList
        style={{flex: 1}}
        data={devices}
        keyExtractor={item => item.id}
        renderItem={renderItem}
      />
      <Button onPress={toggleSwitch} title="Switch(On/Off)" color="#841584" />
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
    width: 50,
    marginTop: 8,
  },
  toolbarTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    flex: 1,
    marginTop: 6,
  },
  deviceName: {
    fontSize: 17,
    color: 'black',
  },
  deviceNameWrap: {
    margin: 10,
    borderBottomWidth: 1,
  },
});

export default App;
