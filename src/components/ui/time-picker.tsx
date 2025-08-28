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
  const [editMode, setEditMode] = useState<"hour" | "minute" | null>(null);
  const [tempValue, setTempValue] = useState("");

  const clockRef = useRef<SVGSVGElement>(null);
  const hourInputRef = useRef<HTMLInputElement>(null);
  const minuteInputRef = useRef<HTMLInputElement>(null);

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
      const finalHour = isAM ? newHour : newHour + 12;
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

  const handleNumberClick = (type: "hour" | "minute") => {
    if (disabled) return;
    setEditMode(type);
    // Hiển thị giờ 12h format (1-12) khi edit
    const displayValue =
      type === "hour" ? displayHour.toString() : minute.toString();
    setTempValue(displayValue);
    setTimeout(() => {
      if (type === "hour" && hourInputRef.current) {
        hourInputRef.current.focus();
        hourInputRef.current.select();
      } else if (type === "minute" && minuteInputRef.current) {
        minuteInputRef.current.focus();
        minuteInputRef.current.select();
      }
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Chỉ cho phép số
    setTempValue(value);
  };

  const handleInputBlur = (type: "hour" | "minute") => {
    let numValue = parseInt(tempValue) || 1;

    if (type === "hour") {
      // Giờ từ 1-12 cho định dạng 12h
      numValue = Math.max(1, Math.min(12, numValue));
      // Chuyển đổi thành 24h format để lưu trữ
      let hour24;
      if (numValue === 12) {
        hour24 = isAM ? 0 : 12;
      } else {
        hour24 = isAM ? numValue : numValue + 12;
      }
      onChange(
        `${hour24.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`
      );
    } else {
      numValue = Math.max(0, Math.min(59, numValue));
      onChange(
        `${hour.toString().padStart(2, "0")}:${numValue
          .toString()
          .padStart(2, "0")}`
      );
    }

    setEditMode(null);
    setTempValue("");
  };

  const handleInputKeyDown = (
    e: React.KeyboardEvent,
    type: "hour" | "minute"
  ) => {
    if (e.key === "Enter") {
      handleInputBlur(type);
    } else if (e.key === "Escape") {
      setEditMode(null);
      setTempValue("");
    }
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

  // Convert 24h to 12h for display (0-11 format)
  const displayHour = hour % 12;
  const isAM = hour < 12;

  // Calculate angles (displayHour is already 0-11)
  const hourAngle = displayHour * 30 - 90;
  const minuteAngle = minute * 6 - 90;

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
      {/* Digital Time Display with Editable Numbers */}
      <div className="flex items-center space-x-1 text-2xl font-mono font-bold text-gray-800">
        {editMode === "hour" ? (
          <input
            ref={hourInputRef}
            type="text"
            value={tempValue}
            onChange={handleInputChange}
            onBlur={() => handleInputBlur("hour")}
            onKeyDown={(e) => handleInputKeyDown(e, "hour")}
            className="w-12 text-center bg-blue-100 border-2 border-blue-300 rounded px-1 focus:outline-none focus:border-blue-500"
            maxLength={2}
            disabled={disabled}
          />
        ) : (
          <span
            onClick={() => handleNumberClick("hour")}
            className={`cursor-pointer hover:bg-blue-100 px-1 rounded transition-colors ${
              disabled ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {displayHour.toString().padStart(2, "0")}
          </span>
        )}

        <span>:</span>

        {editMode === "minute" ? (
          <input
            ref={minuteInputRef}
            type="text"
            value={tempValue}
            onChange={handleInputChange}
            onBlur={() => handleInputBlur("minute")}
            onKeyDown={(e) => handleInputKeyDown(e, "minute")}
            className="w-12 text-center bg-blue-100 border-2 border-blue-300 rounded px-1 focus:outline-none focus:border-blue-500"
            maxLength={2}
            disabled={disabled}
          />
        ) : (
          <span
            onClick={() => handleNumberClick("minute")}
            className={`cursor-pointer hover:bg-blue-100 px-1 rounded transition-colors ${
              disabled ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {minute.toString().padStart(2, "0")}
          </span>
        )}
      </div>

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
                  {i}
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
          Click vào số để chỉnh sửa trực tiếp hoặc kéo kim giờ/phút để đặt thời
          gian
        </p>
      )}
    </div>
  );
};

// Demo component to show usage
const App = () => {
  const [time, setTime] = useState("14:30");

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Enhanced TimePicker
      </h1>
      <TimePicker value={time} onChange={setTime} disabled={false} />
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold text-green-800">Thời gian đã chọn:</h3>
        <p className="text-green-700 font-mono text-lg">{time}</p>
      </div>
    </div>
  );
};

export default App;
