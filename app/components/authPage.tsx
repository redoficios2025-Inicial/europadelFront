import { useUser, User as ContextUser } from './userContext';
import AuthForm from '../registro/page';

export default function AuthPage() {
    const { loginUser } = useUser();

    // Callback que se ejecuta cuando el login/verificación es exitoso
    const handleLoginSuccess = (user: ContextUser, token: string) => {
        // Forzar un valor por defecto si rol es undefined
        const safeUser: ContextUser = {
            ...user,
            rol: user.rol ?? "usuario", // <- rol por defecto "usuario"
        };

        // Guardar token
        localStorage.setItem('token', token);

        // Guardar usuario en contexto
        loginUser(safeUser, token);

    };

}
