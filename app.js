// 🧰 --- Utility Functions --- //

function generateColor(format) {
    if (format === "rgb") {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r}, ${g}, ${b})`;
    } else {
        return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
    }
}

function hexToHSL(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, "");
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function hslToHex(hsl) {
    let { h, s, l } = hsl;
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return (
        "#" +
        [r, g, b]
            .map(x => Math.round(x * 255).toString(16).padStart(2, "0"))
            .join("")
    );
}

// Harmony Functions

function generateComplementaryColor(hex) {
    const hsl = hexToHSL(hex);
    const complementaryHue = (hsl.h + 180) % 360;
    const compColor = hslToHex({ h: complementaryHue, s: hsl.s, l: hsl.l });
    return [hex, compColor];
}

function generateAnalogousColors(hex) {
    const hsl = hexToHSL(hex);
    const angle = 30;
    const color1 = hslToHex({ h: (hsl.h + angle) % 360, s: hsl.s, l: hsl.l });
    const color2 = hslToHex({ h: (hsl.h - angle + 360) % 360, s: hsl.s, l: hsl.l });
    return [color2, hex, color1];
}

function generateMonochromaticColors(hex, count = 3) {
    const hsl = hexToHSL(hex);
    // Spread lightness between 15% and 85% to avoid black/white
    const minL = 15, maxL = 85;
    return Array.from({ length: count }, (_, i) => {
        let l = Math.round(minL + ((maxL - minL) * i) / (count - 1));
        return hslToHex({ h: hsl.h, s: hsl.s, l });
    });
}

function generateTriadicColors(hex) {
    const hsl = hexToHSL(hex);
    const color1 = hslToHex({ h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l });
    const color2 = hslToHex({ h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l });
    return [hex, color1, color2];
}

// Display Function
function displayColors(colors) {
    const container = document.getElementById("color-palette");
    container.innerHTML = "";
    colors.forEach(color => {
        const box = document.createElement("div");
        box.className = "box-color";

        const label = document.createElement("div");
        label.className = "color-label";
        label.textContent = color;

        const swatch = document.createElement("div");
        swatch.className = "color-swatch";
        swatch.style.backgroundColor = color;

        swatch.addEventListener("click", () => {
            navigator.clipboard.writeText(color);
            label.textContent = "Copied!";
            setTimeout(() => (label.textContent = color), 1000);
        });

        box.appendChild(label);
        box.appendChild(swatch);
        container.appendChild(box);
    });
}

// 🎬 --- Main Logic (waits for DOM) --- //
document.addEventListener("DOMContentLoaded", () => {
    const generateBtn = document.getElementById("generate-btn");
    const formatSelect = document.getElementById("color-format");
    let currentPaletteHex = [];

    function hexToRgbStr(hex) {
        let h = hex.replace(/^#/, "");
        let r = parseInt(h.substring(0, 2), 16);
        let g = parseInt(h.substring(2, 4), 16);
        let b = parseInt(h.substring(4, 6), 16);
        return `rgb(${r}, ${g}, ${b})`;
    }

    function showPaletteInFormat(format) {
        let palette = currentPaletteHex.slice();
        if (format === "rgb") {
            palette = palette.map(hexToRgbStr);
        }
        displayColors(palette);
    }

    generateBtn.addEventListener("click", () => {
        const count = parseInt(document.getElementById("color-count").value);
        const format = formatSelect.value;
        const harmony = document.getElementById("harmony").value;

        let palette = [];
        if (harmony === "monochromatic") {
            let baseColor = generateColor("hex");
            palette = generateMonochromaticColors(baseColor, count);
        } else {
            // For other harmonies, use the original logic
            while (palette.length < count) {
                let baseColor = generateColor("hex");
                let newColors;
                switch (harmony) {
                    case "complementary":
                        newColors = generateComplementaryColor(baseColor);
                        break;
                    case "analogous":
                        newColors = generateAnalogousColors(baseColor);
                        break;
                    case "triad":
                        newColors = generateTriadicColors(baseColor);
                        break;
                    default:
                        newColors = [baseColor];
                }
                // Avoid duplicates
                newColors.forEach(color => {
                    if (palette.length < count && !palette.includes(color)) {
                        palette.push(color);
                    }
                });
            }
        }

        // Store the palette in hex for future format changes
        currentPaletteHex = palette.slice(0, count);

        showPaletteInFormat(format);
    });

    formatSelect.addEventListener("change", () => {
        const format = formatSelect.value;
        if (currentPaletteHex.length > 0) {
            showPaletteInFormat(format);
        }
    });
});
