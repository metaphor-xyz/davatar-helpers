import Davatar from '@davatar/react';

import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Davatar size={120} address={'0x9B6568d72A6f6269049Fac3998d1fadf1E6263cc'} />
        <Davatar size={120} address={'0x9B6568d72A6f6269049Fac3998d1fadf1E6263cc'} generatedAvatarType="blockies" />
        <Davatar
          size={120}
          address={'0x9B6568d72A6f6269049Fac3998d1fadf1E6263cc'}
          generatedAvatarType="blockies"
          style={{ borderRadius: 8 }}
        />
        <Davatar
          size={120}
          address={'0x9B6568d72A6f6269049Fac3998d1fadf1E6263cc'}
          defaultComponent={<h2>Loading...</h2>}
        />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
      </header>
    </div>
  );
}

export default App;
