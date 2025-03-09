export default function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <div class="flex justify-center items-center absolute inset-x-0 bottom-0 h-16 bg-opacity-20 w-full bg-teal-700">
            <h1 className="text-lg font-semibold"> &copy; {currentYear} | Gnosis Safe<br /> <span className="pl-4 text-base">All rights reserved.</span></h1>
        </div>
    )
}