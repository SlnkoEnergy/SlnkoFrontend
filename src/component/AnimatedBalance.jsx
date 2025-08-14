import { useEffect, useRef } from "react";
import CountUp from "react-countup";

const AnimatedNumber = ({ value }) => {
  const countUpRef = useRef(null);
  const prevValueRef = useRef(value);
  const isInteger = Number.isInteger(value);

  useEffect(() => {
    if (countUpRef.current && prevValueRef.current !== value) {
      countUpRef.current.update(value);
      prevValueRef.current = value;
    }
  }, [value]);

  const formatINR = (num) => {
    return num.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: isInteger ? 0 : 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <CountUp
      start={prevValueRef.current}
      end={value}
      duration={1.2}
      decimals={isInteger ? 0 : 2}
      preserveValue
      formattingFn={formatINR}
      ref={(el) => {
        if (el) countUpRef.current = el;
      }}
    />
  );
};

export default AnimatedNumber;
