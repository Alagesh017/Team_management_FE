Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class UserIdleInput {
  [StructLayout(LayoutKind.Sequential)]
  struct LASTINPUTINFO { public uint cbSize; public uint dwTime; }
  [DllImport("user32.dll")]
  static extern bool GetLastInputInfo(ref LASTINPUTINFO lii);
  public static int IdleMilliseconds() {
    LASTINPUTINFO lii = new LASTINPUTINFO();
    lii.cbSize = (uint)System.Runtime.InteropServices.Marshal.SizeOf(lii);
    if (!GetLastInputInfo(ref lii)) return 0;
    return (int)(Environment.TickCount - lii.dwTime);
  }
}
"@
[UserIdleInput]::IdleMilliseconds()
