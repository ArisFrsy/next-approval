import type { AppProps } from 'next/app'
import { ConfirmDialogProvider } from '@/lib/confirm-dialog-context'


export default function App({ Component, pageProps }: AppProps) {
    return (
        <ConfirmDialogProvider>
            <Component {...pageProps} />
        </ConfirmDialogProvider>
    )
}
