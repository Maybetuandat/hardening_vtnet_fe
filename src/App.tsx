import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";

import "./i18n"; 

import Lab from "./app/labs/lab-page";
import HomePage from "./app/dashboard";
import SystemHardeningDashboard from "./app/dashboard";
import SshKeysPage from "./app/ssh-keys/ssh-keys-page";


function App() {
  return (
    
      <Router>
        <Routes>
         
          {/* Protected routes */}
          <Route
            path="/home"
            element={
              
                <MainLayout>
                  <SystemHardeningDashboard />
                </MainLayout>
              
            }
          />

          <Route
            path="/"
            element={
              
                <MainLayout>
                  <HomePage />
                </MainLayout>
              
            }
          />

          <Route
            path="/labs"
            element={
              
                <MainLayout>
                  <Lab />
                </MainLayout>
              
            }
          />






           <Route
            path="/ssh-keys"
            element={
              
                <MainLayout>
                  <SshKeysPage />
                </MainLayout>
              
            }
          />
        
        

         </Routes>
      </Router>
    
  );
}

export default App;
