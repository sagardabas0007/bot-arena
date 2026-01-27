'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function WalletConnect() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none' as const,
                userSelect: 'none' as const,
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="px-5 py-2.5 rounded-xl font-orbitron text-xs font-semibold tracking-wider uppercase
                      bg-gradient-to-r from-cyan to-cyan-600 text-dark-blue
                      hover:shadow-neon-cyan hover:-translate-y-0.5
                      transition-all duration-300 active:translate-y-0"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="px-5 py-2.5 rounded-xl font-orbitron text-xs font-semibold tracking-wider uppercase
                      bg-danger/20 border border-danger/50 text-danger
                      hover:bg-danger/30 transition-all duration-300"
                  >
                    Wrong Network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                      bg-surface border border-cyan/20 text-sm
                      hover:border-cyan/40 transition-all duration-300"
                  >
                    {chain.hasIcon && (
                      <div
                        className="w-4 h-4 rounded-full overflow-hidden"
                        style={{ background: chain.iconBackground }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            className="w-4 h-4"
                          />
                        )}
                      </div>
                    )}
                    <span className="text-gray-300 text-xs hidden lg:block">{chain.name}</span>
                  </button>

                  <button
                    onClick={openAccountModal}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg
                      bg-surface border border-cyan/20 text-sm
                      hover:border-cyan/40 hover:shadow-neon-cyan
                      transition-all duration-300"
                  >
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-cyan font-mono text-xs">
                      {account.displayName}
                    </span>
                    {account.displayBalance && (
                      <span className="text-gray-500 text-xs hidden sm:block">
                        ({account.displayBalance})
                      </span>
                    )}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
