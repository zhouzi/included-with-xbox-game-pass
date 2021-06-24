import * as React from "react";

interface HeaderProps {
  children?: React.ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="Container Block Header">
      <h1 className="Logo">
        <span className="LogoCommunity">included</span>
        <span className="LogoDot">-</span>
        <span className="LogoCommunity">with</span>
        <span className="LogoDot">-</span>
        <span className="LogoXGP">xbox</span>
        <span className="LogoDot">-</span>
        <span className="LogoXGP">game</span>
        <span className="LogoDot">-</span>
        <span className="LogoXGP">pass</span>
      </h1>
      <p className="Paragraph">
        Browser extension bringing the Xbox Game Pass to Steam.
      </p>
      {children}
    </header>
  );
}
