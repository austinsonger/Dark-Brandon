import { type AppType } from "next/app";
import "../styles/globals.css";

const MyApp: AppType<{ null }> = ({
    Component,
    pageProps,
}) => {
    return (
        <>
            <div style={{ backgroundColor: 'rgb(34, 197, 94)' }}>
                <Component {...pageProps} />
            </div>
        </>
    );
};

export default MyApp;
