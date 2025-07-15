import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#181e24] flex items-center justify-center">
      <SignIn
        redirectUrl="/"
        appearance={{
          elements: {
            card: 'bg-[#2d3640] text-white shadow-2xl border-2 border-blue-500 transition-transform',
            headerTitle: 'text-white',
            headerSubtitle: 'text-gray-200',
            formFieldInput: 'bg-[#232a32] text-white',
            socialButtonsBlockButton: 'bg-[#323b45] text-black border-gray-400',
            socialButtonsBlockButtonText: 'text-black',
            socialButtonsBlockButtonIcon: 'text-black',
            footerAction: 'text-gray-400',
            footer: 'text-gray-500',
          },
          variables: {
            colorPrimary: '#3b82f6',
            colorBackground: '#2d3640',
            colorText: '#fff',
            colorInputBackground: '#232a32',
            colorInputText: '#fff',
          },
        }}
      />
    </div>
  );
} 