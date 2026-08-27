#!/bin/bash

FILE_NAME=api-management-console${1:+-v$1}
GZ_FILE_NAME=${FILE_NAME}.tar.gz
ZIP_FILE_NAME=${FILE_NAME}.zip

cp -r dist ${FILE_NAME}

tar -czvf ${GZ_FILE_NAME} ${FILE_NAME}
zip -rv9 ${ZIP_FILE_NAME} ${FILE_NAME}

md5sum ${GZ_FILE_NAME} | awk '{ print $1 }' > ${GZ_FILE_NAME}.md5
sha1sum ${GZ_FILE_NAME} | awk '{ print $1 }' > ${GZ_FILE_NAME}.sha1
sha256sum ${GZ_FILE_NAME} | awk '{ print $1 }' > ${GZ_FILE_NAME}.sha256
sha512sum ${GZ_FILE_NAME} | awk '{ print $1 }' > ${GZ_FILE_NAME}.sha512

md5sum ${ZIP_FILE_NAME} | awk '{ print $1 }' > ${ZIP_FILE_NAME}.md5
sha1sum ${ZIP_FILE_NAME} | awk '{ print $1 }' > ${ZIP_FILE_NAME}.sha1
sha256sum ${ZIP_FILE_NAME} | awk '{ print $1 }' > ${ZIP_FILE_NAME}.sha256
sha512sum ${ZIP_FILE_NAME} | awk '{ print $1 }' > ${ZIP_FILE_NAME}.sha512
