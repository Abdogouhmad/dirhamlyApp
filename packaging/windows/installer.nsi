; Dirhamly Windows Installer — NSIS
; Build: makensis installer.nsi

!define PRODUCT_NAME "Dirhamly"
!define PRODUCT_VERSION "0.5.1"
!define PRODUCT_PUBLISHER "Abdogouhmad"
!define PRODUCT_WEB_SITE "https://github.com/Abdogouhmad/dirhamlyApp"
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\dirhamly.exe"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"

Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "Dirhamly-${PRODUCT_VERSION}-Setup.exe"
InstallDir "$PROGRAMFILES64\${PRODUCT_NAME}"
InstallDirRegKey HKLM "${PRODUCT_DIR_REGKEY}" ""
RequestExecutionLevel admin

Section "Install"
    SetOutPath "$INSTDIR"
    File "dirhamly.exe"

    CreateDirectory "$SMPROGRAMS\${PRODUCT_NAME}"
    CreateShortCut "$SMPROGRAMS\${PRODUCT_NAME}\Dirhamly.lnk" "$INSTDIR\dirhamly.exe"
    CreateShortCut "$DESKTOP\Dirhamly.lnk" "$INSTDIR\dirhamly.exe"

    WriteUninstaller "$INSTDIR\uninstall.exe"

    WriteRegStr HKLM "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\dirhamly.exe"
    WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "DisplayName" "${PRODUCT_NAME}"
    WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\uninstall.exe"
    WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
    WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
    WriteRegStr HKLM "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
SectionEnd

Section "Uninstall"
    Delete "$INSTDIR\dirhamly.exe"
    Delete "$INSTDIR\uninstall.exe"
    RMDir "$INSTDIR"

    Delete "$SMPROGRAMS\${PRODUCT_NAME}\Dirhamly.lnk"
    RMDir "$SMPROGRAMS\${PRODUCT_NAME}"
    Delete "$DESKTOP\Dirhamly.lnk"

    DeleteRegKey HKLM "${PRODUCT_DIR_REGKEY}"
    DeleteRegKey HKLM "${PRODUCT_UNINST_KEY}"
SectionEnd
