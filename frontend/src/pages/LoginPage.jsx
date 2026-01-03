import LoginForm from '../components/Auth/LoginForm';

const LoginPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <LoginForm />
        </div>
    );
};

export default LoginPage;