// src/pages/shared/Register/Components/RegisterHero.jsx
export default function RegisterHero({ image }) {
    return (
        <div className="hidden lg:block justify-self-end lg:-ml-6">
            <img
                src={image}
                alt="E-learning Illustration"
                width={661}
                height={583}
                className="block max-w-[720px] w-full h-auto object-contain drop-shadow-sm select-none pointer-events-none"
            />
        </div>
    );
}
