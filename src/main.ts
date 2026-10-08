import './screens/style.css';
import { getStorage } from './save/save';
import { startApp } from './screens/app';

const root = document.getElementById('app');
if (root) startApp(root, getStorage());
