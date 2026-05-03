import React from "react";

export default function Card({ children, className = "", as: Tag = "div" }) {
  return (
    <Tag className={`glass rounded-[2rem] p-5 transition duration-300 hover:-translate-y-1 ${className}`}>
      {children}
    </Tag>
  );
}
