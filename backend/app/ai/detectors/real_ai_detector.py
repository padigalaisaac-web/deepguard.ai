```python
import numpy as np
from PIL import Image
from functools import lru_cache
from huggingface_hub import hf_hub_download
import onnxruntime as ort


MODEL_REPO = "onnx-community/ai-image-detect-distilled-ONNX"
MODEL_FILE = "onnx/model_quantized.onnx"


@lru_cache(maxsize=1)
def get_session():
    model_path = hf_hub_download(
        repo_id=MODEL_REPO,
        filename=MODEL_FILE,
    )

    return ort.InferenceSession(
        model_path,
        providers=["CPUExecutionProvider"],
    )


def _softmax(logits):
    logits = logits - np.max(
        logits,
        axis=-1,
        keepdims=True,
    )

    exp_values = np.exp(logits)

    return exp_values / np.sum(
        exp_values,
        axis=-1,
        keepdims=True,
    )


def predict_ai_probability(image: Image.Image) -> float:
    """
    Returns estimated AI-generated probability from 0-100.

    0   = likely real
    100 = likely AI-generated
    """

    image = image.convert("RGB")

    # Model input size
    image = image.resize(
        (224, 224),
        Image.Resampling.BILINEAR,
    )

    # Convert image to float32
    image_array = (
        np.asarray(image)
        .astype(np.float32)
        / 255.0
    )

    # Model normalization
    image_array = (
        image_array - 0.5
    ) / 0.5

    # HWC -> CHW
    image_array = np.transpose(
        image_array,
        (2, 0, 1),
    )

    # Add batch dimension
    image_array = np.expand_dims(
        image_array,
        axis=0,
    ).astype(np.float32)

    session = get_session()

    input_name = session.get_inputs()[0].name

    outputs = session.run(
        None,
        {
            input_name: image_array
        },
    )

    if not outputs:
        raise RuntimeError(
            "AI model returned no output."
        )

    logits = outputs[0]

    # Convert logits to probabilities
    probabilities = _softmax(logits)[0]

    if len(probabilities) < 2:
        raise RuntimeError(
            "AI model returned an unexpected output shape."
        )

    # Model class 0 = fake / AI-generated
    # Model class 1 = real
    fake_probability = float(
        probabilities[0] * 100.0
    )

    return round(
        max(
            0.0,
            min(
                100.0,
                fake_probability,
            ),
        ),
        2,
    )
```
