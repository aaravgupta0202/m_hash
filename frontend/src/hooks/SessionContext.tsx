import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../services/api";
import { useCurrentUser } from "./CurrentUserContext";

interface SessionContextValue {
  knownDevices: string[];
  knownLocations: string[];
  device: string;
  location: string;
  setDevice: (d: string) => void;
  setLocation: (l: string) => void;
  /** False until this user's real devices/locations have loaded. Actions
   * recorded before this is true would otherwise fall back to the
   * "unregistered/unusual" sentinel and record a false anomaly. */
  ready: boolean;
}

const UNREGISTERED_DEVICE = "Unregistered Device";
const UNUSUAL_LOCATION = "Unrecognized Location";

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { currentUserId } = useCurrentUser();
  const [knownDevices, setKnownDevices] = useState<string[]>([]);
  const [knownLocations, setKnownLocations] = useState<string[]>([]);
  const [device, setDevice] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    if (!currentUserId) return;
    api.user(currentUserId).then((u) => {
      const devices = Array.from(new Set(u.devices.map((d) => d.name)));
      const locations = Array.from(new Set(u.usual_locations));
      setKnownDevices(Array.from(new Set([...devices, UNREGISTERED_DEVICE])));
      setKnownLocations(Array.from(new Set([...locations, UNUSUAL_LOCATION])));
      setDevice(devices[0] ?? UNREGISTERED_DEVICE);
      setLocation(locations[0] ?? UNUSUAL_LOCATION);
      setReady(true);
    });
  }, [currentUserId]);

  return (
    <SessionContext.Provider value={{ knownDevices, knownLocations, device, location, setDevice, setLocation, ready }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
