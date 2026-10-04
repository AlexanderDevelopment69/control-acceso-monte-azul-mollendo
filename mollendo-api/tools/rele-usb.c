/*
 * rele-usb: controla el módulo de relés USB DCTTECH "USBRelay" (HID, sin
 * drivers) por su /dev/hidrawN. El backend lo llama para abrir los molinetes
 * (ver src/integraciones/rele-usb.service.ts); se compila en la imagen Docker.
 *
 *   rele-usb /dev/hidraw0 estado        -> "S2OD2 0"  (serie y estado en bits)
 *   rele-usb /dev/hidraw0 1 on|off      -> enciende o apaga el relé 1
 *
 * El módulo usa "feature reports" de 9 bytes (el primero es el id de reporte,
 * 0): [0, 0xFF, n] enciende el relé n y [0, 0xFD, n] lo apaga. Al leerlo
 * devuelve la serie (bytes 1-5) y el estado (byte 8, un bit por relé).
 */
#include <fcntl.h>
#include <linux/hidraw.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/ioctl.h>
#include <unistd.h>

int main(int argc, char **argv) {
  if (argc < 3) {
    fprintf(stderr, "uso: rele-usb <hidraw> estado | <hidraw> <rele> on|off\n");
    return 2;
  }
  int fd = open(argv[1], O_RDWR);
  if (fd < 0) {
    perror("open");
    return 1;
  }
  unsigned char buf[9];
  memset(buf, 0, sizeof buf);
  if (strcmp(argv[2], "estado") == 0) {
    if (ioctl(fd, HIDIOCGFEATURE(sizeof buf), buf) < 0) {
      perror("leer estado");
      return 1;
    }
    printf("%.5s %u\n", (char *)buf + 1, buf[8]);
    return 0;
  }
  if (argc < 4) {
    fprintf(stderr, "falta on|off\n");
    return 2;
  }
  int rele = atoi(argv[2]);
  if (rele < 1 || rele > 8) {
    fprintf(stderr, "relé inválido: %s\n", argv[2]);
    return 2;
  }
  buf[1] = strcmp(argv[3], "on") == 0 ? 0xFF : 0xFD;
  buf[2] = (unsigned char)rele;
  if (ioctl(fd, HIDIOCSFEATURE(sizeof buf), buf) < 0) {
    perror("cambiar relé");
    return 1;
  }
  return 0;
}
