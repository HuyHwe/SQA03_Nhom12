// src/pages/shared/Login/Components/LoginHero.jsx
export default function LoginHero({ image }) {
    return (
        <div className="hidden lg:block justify-self-end lg:-ml-6">
            <img
                src={image}
                alt="Minh hoạ E-learning"
                width={661}
                height={583}
                className="block max-w-[720px] w-full h-auto object-contain drop-shadow-sm select-none pointer-events-none"
            />
        </div>
    );
}
