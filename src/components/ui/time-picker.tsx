import React, { useState, useRef, useEffect } from "react";

interface TimePickerProps {
  value: string; // Format: "HH:MM"
  onChange: (time: string) => void;
  disabled?: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [hour, minute] = value.split(":").map(Number);
  const [isDragging, setIsDragging] = useState<"hour" | "minute" | null>(null);
  const clockRef = useRef<SVGSVGElement>(null);

  const handleMouseDown = (type: "hour" | "minute") => {
    if (!disabled) {
      setIsDragging(type);
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging || !clockRef.current || disabled) return;

    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;

    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    if (isDragging === "hour") {
      const newHour = Math.round(angle / 30) % 12;
      const adjustedHour = newHour === 0 ? 12 : newHour;
      const finalHour =
        hour >= 12
          ? adjustedHour === 12
            ? 12
            : adjustedHour + 12
          : adjustedHour === 12
          ? 0
          : adjustedHour;
      onChange(
        `${finalHour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`
      );
    } else if (isDragging === "minute") {
      const newMinute = Math.round(angle / 6) % 60;
      onChange(
        `${hour.toString().padStart(2, "0")}:${newMinute
          .toString()
          .padStart(2, "0")}`
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  // Convert 24h to 12h for display
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const isAM = hour < 12;

  // Calculate angles
  const hourAngle = (displayHour % 12) * 30 - 90; // 30 degrees per hour
  const minuteAngle = minute * 6 - 90; // 6 degrees per minute

  // Calculate positions
  const hourX = Math.cos((hourAngle * Math.PI) / 180) * 50;
  const hourY = Math.sin((hourAngle * Math.PI) / 180) * 50;
  const minuteX = Math.cos((minuteAngle * Math.PI) / 180) * 70;
  const minuteY = Math.sin((minuteAngle * Math.PI) / 180) * 70;

  const toggleAMPM = () => {
    if (disabled) return;
    const newHour = isAM ? hour + 12 : hour - 12;
    onChange(
      `${newHour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`
    );
  };

  return (
    <div className="flex flex-col items-center space-y-4 select-none">
      {/* Digital Time Display */}
      <div className="text-2xl font-mono font-bold text-gray-800">{value}</div>

      {/* Clock */}
      <div className="relative">
        <svg
          ref={clockRef}
          width="200"
          height="200"
          className="border-2 border-gray-200 rounded-full bg-gray-50"
          style={{ cursor: disabled ? "not-allowed" : "pointer" }}
        >
          {/* Clock face */}
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="white"
            stroke="#e5e5e5"
            strokeWidth="2"
          />

          {/* Hour markers */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = ((i * 30 - 90) * Math.PI) / 180;
            const x1 = 100 + Math.cos(angle) * 85;
            const y1 = 100 + Math.sin(angle) * 85;
            const x2 = 100 + Math.cos(angle) * 75;
            const y2 = 100 + Math.sin(angle) * 75;

            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#374151"
                  strokeWidth="2"
                />
                <text
                  x={100 + Math.cos(angle) * 65}
                  y={100 + Math.sin(angle) * 65}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm font-semibold fill-gray-700"
                >
                  {i === 0 ? 12 : i}
                </text>
              </g>
            );
          })}

          {/* Minute markers */}
          {Array.from({ length: 60 }, (_, i) => {
            if (i % 5 !== 0) {
              const angle = ((i * 6 - 90) * Math.PI) / 180;
              const x1 = 100 + Math.cos(angle) * 85;
              const y1 = 100 + Math.sin(angle) * 85;
              const x2 = 100 + Math.cos(angle) * 80;
              const y2 = 100 + Math.sin(angle) * 80;

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#9ca3af"
                  strokeWidth="1"
                />
              );
            }
            return null;
          })}

          {/* Hour hand */}
          <line
            x1="100"
            y1="100"
            x2={100 + hourX}
            y2={100 + hourY}
            stroke="#1f2937"
            strokeWidth="4"
            strokeLinecap="round"
            style={{ cursor: disabled ? "not-allowed" : "grab" }}
            onMouseDown={() => handleMouseDown("hour")}
          />

          {/* Minute hand */}
          <line
            x1="100"
            y1="100"
            x2={100 + minuteX}
            y2={100 + minuteY}
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ cursor: disabled ? "not-allowed" : "grab" }}
            onMouseDown={() => handleMouseDown("minute")}
          />

          {/* Center dot */}
          <circle cx="100" cy="100" r="6" fill="#374151" />

          {/* Hour hand dot */}
          <circle
            cx={100 + hourX}
            cy={100 + hourY}
            r="8"
            fill="#1f2937"
            style={{ cursor: disabled ? "not-allowed" : "grab" }}
            onMouseDown={() => handleMouseDown("hour")}
          />

          {/* Minute hand dot */}
          <circle
            cx={100 + minuteX}
            cy={100 + minuteY}
            r="6"
            fill="#3b82f6"
            style={{ cursor: disabled ? "not-allowed" : "grab" }}
            onMouseDown={() => handleMouseDown("minute")}
          />
        </svg>
      </div>

      {/* AM/PM Toggle */}
      <button
        onClick={toggleAMPM}
        disabled={disabled}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
        }`}
      >
        {isAM ? "AM" : "PM"}
      </button>

      {/* Instructions */}
      {!disabled && (
        <p className="text-sm text-gray-600 text-center max-w-xs">
          Kéo kim giờ (đen) hoặc kim phút (xanh) để đặt thời gian
        </p>
      )}
    </div>
  );
};

export default TimePicker;
