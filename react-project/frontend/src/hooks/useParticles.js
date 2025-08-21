import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const useParticles = () => {
    const particlesContainerRef = useRef(null);
    const { isDarkMode } = useTheme();

    useEffect(() => {
        if (!particlesContainerRef.current) return;

        const container = particlesContainerRef.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
        };

        // Create particles
        const createParticles = () => {
            particles = [];
            const particleCount = 50;
            const color = isDarkMode ? '#ffffff' : '#000000';

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 3 + 1,
                    speedX: Math.random() * 2 - 1,
                    speedY: Math.random() * 2 - 1,
                    color: color
                });
            }
        };

        // Draw particles
        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = 0.1;
                ctx.fill();

                // Draw connections
                particles.forEach(otherParticle => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.strokeStyle = particle.color;
                        ctx.globalAlpha = 0.1 * (1 - distance / 150);
                        ctx.stroke();
                    }
                });
            });
        };

        // Update particles
        const updateParticles = () => {
            particles.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                // Bounce off edges
                if (particle.x < 0 || particle.x > canvas.width) {
                    particle.speedX *= -1;
                }
                if (particle.y < 0 || particle.y > canvas.height) {
                    particle.speedY *= -1;
                }
            });
        };

        // Animation loop
        const animate = () => {
            updateParticles();
            drawParticles();
            animationFrameId = requestAnimationFrame(animate);
        };

        // Initialize
        container.appendChild(canvas);
        resizeCanvas();
        createParticles();
        animate();

        // Handle resize
        window.addEventListener('resize', () => {
            resizeCanvas();
            createParticles();
        });

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
            container.removeChild(canvas);
        };
    }, [isDarkMode]);

    return { particlesContainerRef };
}; 