import safe from '../assets/safe.png'
import { useNavigate } from 'react-router-dom'
export default function NavBar() {
    const navigate = useNavigate();
    const handleHomeNavigation = () => {
        navigate('/')
    }

    const handleNavigate = () => {
        navigate('/welcome')
    }
    return (
        <div className="flex flex-row justify-between items-center bg-opacity-20 w-full h-20 px-6 p-2 bg-teal-700">
            <img onClick={handleHomeNavigation} className="hover:animate-bounce cursor-pointer h-16 w-16" src={safe} alt="App-Icon" />
            <h1 className="font-bold text-4xl">Gnosis Safe</h1>
            <div className='flex justify-end w-40'>
                <button onClick={handleNavigate} className='ease-in duration-300 rounded-md text-normal w-32 h-8 font-semibold shadow-md bg-teal-800 hover:bg-opacity-50 hover:w-36 hover:h-9 hover:delay-150 hover:text-lg'>Launch Wallet</button>
            </div>
        </div>
    )
}