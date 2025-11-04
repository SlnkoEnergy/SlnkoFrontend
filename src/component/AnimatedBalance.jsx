import { useEffect, useRef } from "react";
import CountUp from "react-countup";

const AnimatedNumber = ({ value, duration = 1.2, formattingFn, prefix = "", suffix = "" }) => {
  const countUpRef = useRef(null);
  const prevValueRef = useRef(value);
  const isInteger = Number.isInteger(value);

  useEffect(() => {
    if (countUpRef.current && prevValueRef.current !== value) {
      countUpRef.current.update(value);
      prevValueRef.current = value;
    }
  }, [value]);

  // const formatNumber = (num) => {
  //   if (format === "inr") {
  //     return num.toLocaleString("en-IN", {
  //       style: "currency",
  //       currency: "INR",
  //       minimumFractionDigits: isInteger ? 0 : 2,
  //       maximumFractionDigits: 2,
  //     });
  //   }
  //   if (format === "number") {
  //     return num.toLocaleString("en-IN", {
  //       minimumFractionDigits: isInteger ? 0 : 2,
  //       maximumFractionDigits: 2,
  //     });
  //   }
  //   return num;
  // };

  return (
    <CountUp
      start={prevValueRef.current}
      end={value}
      duration={duration}
      separator={formattingFn ? undefined : ","}
      decimals={formattingFn ? 0 : isInteger ? 0 : 2}
      preserveValue
      formattingFn={formattingFn ? (v) => `${prefix}${formattingFn(v)}${suffix}` : undefined}
      ref={(el) => {
        if (el) countUpRef.current = el;
      }}
    />
  );
};

export default AnimatedNumber;
