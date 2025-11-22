export default function Welcome({ message = 'Welcome to Laravel with Inertia.js and React!' }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            fontFamily: 'system-ui, sans-serif'
        }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                {message}
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#666' }}>
                Start building your application in resources/js/Pages
            </p>
        </div>
    );
}
