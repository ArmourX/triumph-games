mergeInto(LibraryManager.library, {
    QRM_OpenPhotoCapture: function (gameObjectPtr, okMethodPtr, failMethodPtr) {
        var gameObject = UTF8ToString(gameObjectPtr);
        var okMethod = UTF8ToString(okMethodPtr);
        var failMethod = UTF8ToString(failMethodPtr);

        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.setAttribute('capture', 'environment');
        input.style.display = 'none';

        var cleanup = function () {
            if (input.parentNode) {
                input.parentNode.removeChild(input);
            }
        };

        input.onchange = function () {
            var file = input.files && input.files[0];
            cleanup();

            if (!file) {
                SendMessage(gameObject, failMethod, 'No photo selected');
                return;
            }

            var reader = new FileReader();
            reader.onload = function () {
                var img = new Image();
                img.onload = function () {
                    try {
                        var maxEdge = 1280;
                        var width = img.width;
                        var height = img.height;

                        if (width > maxEdge || height > maxEdge) {
                            if (width > height) {
                                height = Math.round(height * (maxEdge / width));
                                width = maxEdge;
                            } else {
                                width = Math.round(width * (maxEdge / height));
                                height = maxEdge;
                            }
                        }

                        var canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        var ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);

                        if (typeof BarcodeDetector !== 'undefined') {
                            var detector = new BarcodeDetector({ formats: ['qr_code'] });
                            detector.detect(canvas).then(function (codes) {
                                if (codes && codes.length > 0 && codes[0].rawValue) {
                                    SendMessage(gameObject, okMethod, codes[0].rawValue);
                                } else {
                                    SendMessage(gameObject, okMethod, canvas.toDataURL('image/jpeg', 0.88));
                                }
                            }).catch(function () {
                                SendMessage(gameObject, okMethod, canvas.toDataURL('image/jpeg', 0.88));
                            });
                        } else {
                            SendMessage(gameObject, okMethod, canvas.toDataURL('image/jpeg', 0.88));
                        }
                    } catch (e) {
                        SendMessage(gameObject, failMethod, 'Could not process photo');
                    }
                };

                img.onerror = function () {
                    SendMessage(gameObject, failMethod, 'Could not load photo');
                };

                img.src = reader.result;
            };

            reader.onerror = function () {
                cleanup();
                SendMessage(gameObject, failMethod, 'Could not read photo');
            };

            reader.readAsDataURL(file);
        };

        document.body.appendChild(input);
        input.click();
    }
});
