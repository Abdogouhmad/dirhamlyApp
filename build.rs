fn main() {
    slint_build::compile("ui/app.slint").unwrap();

    if std::env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("windows") {
        let mut res = winresource::WindowsResource::new();
        res.set_icon("packaging/icons/icon.ico");
        res.compile().unwrap();
    }
}
