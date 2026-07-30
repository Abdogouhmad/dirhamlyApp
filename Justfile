default:
    @just --list

dev:
    cargo run

# run the app at developemnet mode
run: dev

# format the project
fmt:
    cargo fmt --all

# check the format
fmt-check:
    cargo fmt --all -- --check

# check linting of the project using clippy
lint:
    cargo clippy --all-targets --all-features -- -D warnings

# check all the steps
check: fmt-check lint
    cargo test

# build the project into release mode
build:
    cargo build --release

# clean the target of the project
clean:
    cargo clean

# clean the local db stored by the app
clean-db-linux:
    rm -rf ~/.local/share/dirhamly
    @echo "Linux app data deleted."

# overall clean
reset: clean clean-db-linux run

# generate the SRCINFO
aur-update:
    cd packaging/aur && makepkg --printsrcinfo > .SRCINFO

# test the aur
aur-test:
    cd packaging/aur && makepkg -si
