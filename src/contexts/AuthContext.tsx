import Auth from "@/components/Dialogs/Auth/Auth";
import {
	createContext,
	useContext,
	useState,
	ReactNode,
} from "react";

interface AuthContextType {
	isOpen: boolean;
	setIsOpen: (state: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<AuthContext.Provider value={{ isOpen, setIsOpen }}>
			<Auth />
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	
	if (context === undefined) {
		throw new Error("useAuth must be used within a AuthProvider");
	}
	return context;
}
