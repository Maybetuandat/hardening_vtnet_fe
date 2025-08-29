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
    // Chặn tất cả khi disabled
    if (disabled) return;
    setIsDragging(type);
  };

  const handleMouseMove = (event: MouseEvent) => {
    // Chặn khi disabled hoặc không có dragging
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
    // Chặn khi disabled
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
    // Chặn khi disabled
    if (disabled) return;

    const value = e.target.value.replace(/\D/g, ""); // Chỉ cho phép số
    setTempValue(value);
  };

  const handleInputBlur = (type: "hour" | "minute") => {
    // Chặn khi disabled
    if (disabled) {
      setEditMode(null);
      setTempValue("");
      return;
    }

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

  const toggleAMPM = () => {
    // Chặn khi disabled
    if (disabled) return;

    const newHour = isAM ? hour + 12 : hour - 12;
    onChange(
      `${newHour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`
    );
  };

  useEffect(() => {
    if (isDragging && !disabled) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, disabled]);

  // Convert 24h to 12h for display (0-11 format)
  const displayHour = hour % 12 || 12; // Hiển thị 12 thay vì 0
  const isAM = hour < 12;

  // Calculate angles (displayHour is already 1-12, convert to 0-11 for calculation)
  const hourAngle = (displayHour % 12) * 30 - 90;
  const minuteAngle = minute * 6 - 90;

  // Calculate positions
  const hourX = Math.cos((hourAngle * Math.PI) / 180) * 50;
  const hourY = Math.sin((hourAngle * Math.PI) / 180) * 50;
  const minuteX = Math.cos((minuteAngle * Math.PI) / 180) * 70;
  const minuteY = Math.sin((minuteAngle * Math.PI) / 180) * 70;

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
            className={`px-1 rounded transition-colors ${
              disabled
                ? "cursor-not-allowed opacity-50 text-gray-400"
                : "cursor-pointer hover:bg-blue-100"
            }`}
          >
            {displayHour.toString().padStart(2, "0")}
          </span>
        )}

        <span className={disabled ? "text-gray-400" : ""}>:</span>

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
            className={`px-1 rounded transition-colors ${
              disabled
                ? "cursor-not-allowed opacity-50 text-gray-400"
                : "cursor-pointer hover:bg-blue-100"
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
          className={`border-2 border-gray-200 rounded-full ${
            disabled ? "bg-gray-100 opacity-60" : "bg-gray-50"
          }`}
          style={{ cursor: disabled ? "not-allowed" : "default" }}
        >
          {/* Clock face */}
          <circle
            cx="100"
            cy="100"
            r="95"
            fill={disabled ? "#f9fafb" : "white"}
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
                  stroke={disabled ? "#9ca3af" : "#374151"}
                  strokeWidth="2"
                />
                <text
                  x={100 + Math.cos(angle) * 65}
                  y={100 + Math.sin(angle) * 65}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-sm font-semibold ${
                    disabled ? "fill-gray-400" : "fill-gray-700"
                  }`}
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
                  stroke={disabled ? "#d1d5db" : "#9ca3af"}
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
            stroke={disabled ? "#9ca3af" : "#1f2937"}
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
            stroke={disabled ? "#9ca3af" : "#3b82f6"}
            strokeWidth="3"
            strokeLinecap="round"
            style={{ cursor: disabled ? "not-allowed" : "grab" }}
            onMouseDown={() => handleMouseDown("minute")}
          />

          {/* Center dot */}
          <circle
            cx="100"
            cy="100"
            r="6"
            fill={disabled ? "#9ca3af" : "#374151"}
          />

          {/* Hour hand dot */}
          <circle
            cx={100 + hourX}
            cy={100 + hourY}
            r="8"
            fill={disabled ? "#9ca3af" : "#1f2937"}
            style={{ cursor: disabled ? "not-allowed" : "grab" }}
            onMouseDown={() => handleMouseDown("hour")}
          />

          {/* Minute hand dot */}
          <circle
            cx={100 + minuteX}
            cy={100 + minuteY}
            r="6"
            fill={disabled ? "#9ca3af" : "#3b82f6"}
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
            ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
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

      {disabled && (
        <p className="text-sm text-gray-400 text-center max-w-xs">
          Vui lòng kích hoạt để chỉnh sửa thời gian
        </p>
      )}
    </div>
  );
};

export default TimePicker;
