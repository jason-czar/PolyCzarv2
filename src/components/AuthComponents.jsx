import React from 'react';
import { 
  SignIn, 
  SignUp, 
  SignedIn, 
  SignedOut, 
  UserButton 
} from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';

// Protected route wrapper component
export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" state={{ from: location }} replace />
      </SignedOut>
    </>
  );
};

// SignIn component with custom styling
export const CustomSignIn = () => {
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 dark:bg-polyDark py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-polyDark-lighter p-8 rounded-xl shadow-card">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sign in to PolyCzar
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Access your portfolio and trading history
          </p>
        </div>
        <SignIn 
          path="/sign-in" 
          routing="path" 
          signUpUrl="/sign-up" 
          redirectUrl={from}
          appearance={{
            elements: {
              formButtonPrimary: 'bg-polyIndigo-600 hover:bg-polyIndigo-700 text-white',
              card: 'dark:bg-transparent shadow-none',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'dark:bg-polyDark-lighter dark:border-gray-700 dark:text-white',
              formFieldInput: 'dark:bg-polyDark dark:border-gray-700 dark:text-white',
              formFieldLabel: 'dark:text-gray-300',
              footerActionText: 'dark:text-gray-400',
              footerActionLink: 'dark:text-polyIndigo-400 hover:dark:text-polyIndigo-300',
            }
          }}
        />
      </div>
    </div>
  );
};

// SignUp component with custom styling
export const CustomSignUp = () => {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 dark:bg-polyDark py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-polyDark-lighter p-8 rounded-xl shadow-card">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Start trading options on prediction markets
          </p>
        </div>
        <SignUp 
          path="/sign-up" 
          routing="path" 
          signInUrl="/sign-in"
          redirectUrl="/"
          appearance={{
            elements: {
              formButtonPrimary: 'bg-polyIndigo-600 hover:bg-polyIndigo-700 text-white',
              card: 'dark:bg-transparent shadow-none',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'dark:bg-polyDark-lighter dark:border-gray-700 dark:text-white',
              formFieldInput: 'dark:bg-polyDark dark:border-gray-700 dark:text-white',
              formFieldLabel: 'dark:text-gray-300',
              footerActionText: 'dark:text-gray-400',
              footerActionLink: 'dark:text-polyIndigo-400 hover:dark:text-polyIndigo-300',
            }
          }}
        />
      </div>
    </div>
  );
};

// User profile button component with custom styling
export const ProfileButton = () => {
  return (
    <UserButton 
      appearance={{
        elements: {
          userButtonAvatarBox: 'w-8 h-8',
          userButtonTrigger: 'focus:shadow-outline-indigo',
          userButtonPopoverCard: 'dark:bg-polyDark-lighter dark:border-gray-700',
          userButtonPopoverActionButton: 'dark:text-gray-300 dark:hover:bg-gray-700',
          userButtonPopoverActionButtonText: 'dark:text-gray-300',
          userButtonPopoverActionButtonIcon: 'dark:text-gray-300',
        }
      }}
    />
  );
};
