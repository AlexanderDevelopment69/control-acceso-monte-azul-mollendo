/*
 * sondeo-serie: pregunta al adaptador USB-serie de un lector de DNI si responde.
 * El backend lo llama cada 30 s (ver src/lectores-dni/lectores-dni.service.ts);
 * se compila en la imagen Docker.
 *
 *   sondeo-serie /dev/ttyUSB1   -> "responde" (sale con 0) o el error (sale con 1)
 *
 * Un adaptador trabado no avisa solo: el puerto sigue abierto y simplemente no
 * llegan lecturas. Volver a activar la línea DTR (ya activa desde que se abrió
 * el puerto, así que el lector no nota nada) obliga al adaptador a contestar por
 * USB; si está trabado, falla con "Protocol error" (-71) o "Input/output error".
 */
#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <string.h>
#include <sys/ioctl.h>
#include <termios.h>
#include <unistd.h>

int main(int argc, char **argv) {
  if (argc < 2) {
    fprintf(stderr, "uso: sondeo-serie <tty>\n");
    return 2;
  }
  int fd = open(argv[1], O_RDWR | O_NOCTTY | O_NONBLOCK);
  if (fd < 0) {
    printf("%s\n", strerror(errno));
    return 1;
  }
  int lineas = TIOCM_DTR;
  if (ioctl(fd, TIOCMBIS, &lineas) < 0) {
    printf("%s\n", strerror(errno));
    close(fd);
    return 1;
  }
  close(fd);
  printf("responde\n");
  return 0;
}
