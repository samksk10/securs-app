import LoginForm from '../components/Auth/LoginForm';

const LoginPage = () => {
    return (
        <div className="min-vh-100 bg-light d-flex flex-column justify-content-center py-5 px-3 px-sm-4 px-lg-5">
            <LoginForm />
        </div>
    );
};

export default LoginPage;