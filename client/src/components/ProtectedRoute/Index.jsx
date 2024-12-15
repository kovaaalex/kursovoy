import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children }) => {
    
    const token = localStorage.getItem('token');
    const success = localStorage.getItem('success');
    // Если токена нет, перенаправляем на страницу входа
    if (!token || success === "false") {
        return <Navigate to="/login" />;
    }

    // Декодируем токен и проверяем его срок действия
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Время в секундах

    // Проверяем, истек ли токен
    if (decodedToken.exp < currentTime) {
        localStorage.removeItem('token'); // Удаляем токен
        return <Navigate to="/login" />;
    }

    // Если токен действителен, возвращаем дочерние элементы
    return children;
};

export default ProtectedRoute;