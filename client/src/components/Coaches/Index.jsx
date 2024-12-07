import React, { useEffect, useState } from 'react'
export default function Coaches() {
    const [coaches, setCoaches] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    useEffect(() => {
        const fetchCoaches = async() => {
            try {
                const response = await fetch('http://localhost:5000/api/coaches')
                if(!response.ok) 
                    throw new Error('Error')
                const data = await response.json()
                setCoaches(data)
            } catch (err) {
                console.error(err.message)
                setError(err)
            } finally {
                setLoading(false)
            }
        }
        fetchCoaches()
    }, [])
    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <div>
            {coaches.length > 0 ? (
                coaches.map(coach => (
                    <div key={coach.id}>
                        <span>{coach.first_name} {coach.last_name}</span>
                        <span>{coach.role}</span>
                    </div>
                ))
            ) : (
                <p>No non-main coaches found</p>
            )}
        </div>
    )
}