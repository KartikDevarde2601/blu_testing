import {createStackNavigator} from '@react-navigation/stack';
import BluetoothList from '../screens/bluetoothList.screen';
import DataSending from '../screens/dataSending.screen';
const Stack = createStackNavigator();

const MyStack = () => {
  return (
    <Stack.Navigator initialRouteName="BluList">
      <Stack.Screen name="BluList" component={BluetoothList} />
      <Stack.Screen name="Home" component={DataSending} />
    </Stack.Navigator>
  );
};

export default MyStack;
