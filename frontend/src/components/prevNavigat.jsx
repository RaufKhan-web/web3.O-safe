import { useNavigate } from "react-router-dom";
export default function PrevNavigate() {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(-1);

    }
    return (
        <div className="absolute top-5 left-5">
            <button
                onClick={handleClick}
                className="w-10 h-10 pb-2 box-border rounded-full shadow-lg bg-opacity-60 bg-black hover:bg-opacity-50 hover:delay-200 place-self-center text-2xl text-gray-300 hover:text-3xl"
            >
                &lt;
            </button>
        </div>
    )
}