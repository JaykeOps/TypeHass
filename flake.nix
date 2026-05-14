{
  description = "Deno development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = {
    self,
    nixpkgs,
  }: let
    systems = [
      "x86_64-linux"
      "aarch64-linux"
      "x86_64-darwin"
      "aarch64-darwin"
    ];

    forAllSystems = nixpkgs.lib.genAttrs systems;
  in {
    devShells = forAllSystems (system: let
      pkgs = import nixpkgs {inherit system;};
    in {
      default = pkgs.mkShell {
        packages = with pkgs; [
          deno
          git
          nixfmt-rfc-style
        ];

        shellHook = ''
          export DENO_DIR="$PWD/.deno"
          echo "Deno: $(deno --version | head -n 1)"
        '';
      };
    });
  };
}
