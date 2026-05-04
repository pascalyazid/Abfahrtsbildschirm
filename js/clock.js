document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("sbb-clock");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let radius = canvas.height / 2;
    ctx.translate(radius, radius);
    radius = radius * 0.85;

    function drawClock() {
        drawFace(ctx, radius);
        drawNumbers(ctx, radius);
        drawTime(ctx, radius);
        requestAnimationFrame(drawClock);
    }

    function drawFace(ctx, radius) {
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
    }

    function drawNumbers(ctx, radius) {
        let ang;
        // 60 minute ticks
        for (let num = 0; num < 60; num++) {
            ang = (num * Math.PI) / 30;
            ctx.beginPath();
            // Every 5th tick is thicker and longer (hour marks)
            ctx.lineWidth = num % 5 === 0 ? radius * 0.07 : radius * 0.02;
            ctx.lineCap = "square";

            let tickLength = num % 5 === 0 ? radius * 0.2 : radius * 0.06;

            ctx.moveTo(
                Math.cos(ang) * (radius - tickLength),
                Math.sin(ang) * (radius - tickLength),
            );
            ctx.lineTo(Math.cos(ang) * radius, Math.sin(ang) * radius);
            ctx.strokeStyle = "black";
            ctx.stroke();
        }
    }

    function drawTime(ctx, radius) {
        const now = new Date();
        let hour = now.getHours();
        let minute = now.getMinutes();
        let second = now.getSeconds();
        let ms = now.getMilliseconds();

        // Smooth sweeping second hand
        second = second + ms / 1000;

        // Hour hand
        hour = hour % 12;
        hour =
            (hour * Math.PI) / 6 +
            (minute * Math.PI) / (6 * 60) +
            (second * Math.PI) / (360 * 60);
        drawHand(ctx, hour, radius * 0.6, radius * 0.1, "black");

        // Minute hand
        minute = (minute * Math.PI) / 30 + (second * Math.PI) / (30 * 60);
        drawHand(ctx, minute, radius * 0.85, radius * 0.08, "black");

        // Second hand (SBB iconic red hand with circle)
        let secAngle = (second * Math.PI) / 30;

        ctx.beginPath();
        ctx.lineWidth = radius * 0.03;
        ctx.strokeStyle = "#eb0000"; // SBB Red
        ctx.lineCap = "square";

        // Hand goes a bit past the center
        ctx.moveTo(
            -Math.sin(secAngle) * radius * 0.25,
            Math.cos(secAngle) * radius * 0.25,
        );
        ctx.lineTo(
            Math.sin(secAngle) * radius * 0.65,
            -Math.cos(secAngle) * radius * 0.65,
        );
        ctx.stroke();

        // The red circle near the tip
        ctx.beginPath();
        ctx.arc(
            Math.sin(secAngle) * radius * 0.75,
            -Math.cos(secAngle) * radius * 0.75,
            radius * 0.11,
            0,
            2 * Math.PI,
        );
        ctx.fillStyle = "#eb0000";
        ctx.fill();

        // Black center pin
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.02, 0, 2 * Math.PI);
        ctx.fillStyle = "black";
        ctx.fill();
    }

    function drawHand(ctx, pos, length, width, color) {
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.lineCap = "square";
        ctx.strokeStyle = color;
        // Start slightly behind the center
        ctx.moveTo(-Math.sin(pos) * length * 0.2, Math.cos(pos) * length * 0.2);
        ctx.lineTo(Math.sin(pos) * length, -Math.cos(pos) * length);
        ctx.stroke();
    }

    // Start animation loop
    requestAnimationFrame(drawClock);
});
