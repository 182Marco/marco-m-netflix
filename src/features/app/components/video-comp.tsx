import { component$, type PropFunction, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type { MediaItem } from "../../../store/app.types";
import "./video-comp.scss";

export interface VideoCompProps {
  keyFromApi: string;
  obj: MediaItem;
  onClose$?: PropFunction<() => void>;
}

export const VideoComp = component$((props: VideoCompProps) => {
  const renderVideo = useSignal(true);
  const showXclose = useSignal(false);

  useVisibleTask$(({ cleanup }) => {
    const timeoutId = window.setTimeout(() => {
      showXclose.value = true;
    }, 700);

    cleanup(() => {
      window.clearTimeout(timeoutId);
    });
  });

  if (!renderVideo.value) {
    return null;
  }

  return (
    <div class="wrap">
      <i
        class="x close fas fa-times"
        style={{ display: showXclose.value ? "block" : "none" }}
        onClick$={() => {
          renderVideo.value = false;
          props.onClose$?.();
        }}
      />
      <iframe
        src={`https://www.youtube.com/embed/${props.keyFromApi}?autoplay=1`}
        title={props.obj.title}
        frameBorder="0"
        allowFullscreen
        allow="autoplay"
      />
    </div>
  );
});
