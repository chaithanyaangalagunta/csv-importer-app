import React, { useState, useEffect } from "react";

export function WaitTillAppInitialisedApp({ onLoaded, children, app }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    console.log("Waiting for app to initialise", loaded, app);
    if (!app) {
      console.log("Waiting for app to initialise", window.rliSdk);
      if (window.rliSdk &&  !loaded) {
        console.log("Initialising app", window.rliSdk);
        window.rliSdk.init({}).then((client) => {
          // window.initialiseEventHandlers?.(client)
          console.log("Initialised app", client);
          client.data.get(client.data.dataIdentifiers.GET_USER_DATA).then((userData) => {
            console.log("User data", userData);
            onLoaded(client);
            setLoaded(true);
          });
        });
      } else {
        console.log("App already initialised", loaded, window.rliSdk.isInitialized());
      }
    } else {
      console.log("App already initialised", loaded);
    }
  }, [app, onLoaded, loaded]);

  if (!loaded) {
    return <div>Loading...</div>;
  }

  return children;
}
