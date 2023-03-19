import { RouterProvider } from 'react-router-dom';
import router from './router';
import './styles.css';

export function App() {
  return <RouterProvider router={router} />;
}

export default App;
